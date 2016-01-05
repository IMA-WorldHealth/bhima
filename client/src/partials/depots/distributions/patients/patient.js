angular.module('bhima.controllers')
.controller('StockDistributionsController', StockDistributionsController);

StockDistributionsController.$inject = [
  '$q', '$http', '$routeParams', '$location', 'connect', 'messenger', 'util', 'uuid', '$translate'
];

/**
* This module is responsible to distributing drugs to patients in fulfillment
* of prepaid sales.  There will be warnings if a patient has not paid for their
* sale, yet it is still possible to distribute drugs to that patient.
*
* Furthermore, the module makes efforts to recommend lot numbers of medications
* that will expire in the near future.  Distribution of medications that have
* already expired is strictly prohibited.
*
* @constructor
*/
function StockDistributionsController($q, $http, $routeParams, $location, connect, messenger, util, uuid, $translate) {
  var vm = this;

  vm.session = {
    // FIXME
    index : -1,
    state : null,
    depot : $routeParams.depotId,
    lotSelectionSuccess : false,
    lotSelectionFailure : false,
    dataDebitor : []
  };

  var dependencies = {};

  // Test for module organised into step structure
  var moduleDefinition = vm.moduleDefinition = [{
    title : $translate.instant('DISTRIBUTION.LOCATE_PATIENT'),
    template : 'patientSearch.tmpl.html',
    method : null
  }, {
    title : $translate.instant('DISTRIBUTION.SELECT_PRESCRIPTION'),
    template : 'selectSale.tmpl.html',
    method : null
  }, {
    title : $translate.instant('DISTRIBUTION.ALLOCATE_MEDECINE'),
    template : 'allocateLot.tmpl.html',
    method : null
  }];

  var stock = {
    NONE : {
      alert : $translate.instant('DISTRIBUTION.NONE'),
      icon : 'glyphicon-remove-sign error'
    },
    LIMITED_STOCK : {
      alert :  $translate.instant('DISTRIBUTION.LIMITED_STOCK'),
      icon : 'glyphicon-info-sign warn'
    },
    EXPIRED : {
      alert : $translate.instant('DISTRIBUTION.EXPIRED'),
      icon : 'glyphicon-info-sign error'
    }
  };

  dependencies.ledger = {};

  moduleStep();

  function initialiseDistributionDetails(patient) {
    vm.session.patient = patient;
    return $http.get('/ledgers/debitor/' + patient.debitor_uuid).then(startup).catch(function (err){console.log('error when fecthing data');});
  }

  function startup(model) {
    vm.ledger = model;
    // filter out invoices that are either not distributable, or have
    // already been consumed.

    vm.ledger.data = vm.ledger.data.filter(function (data) {
      return data.is_distributable === 1 && data.consumed === 0;
    });

    moduleStep();
  }

  function moduleStep() {
    vm.session.index += 1;
    vm.session.state = moduleDefinition[vm.session.index];
  }

  function selectSale(sale) {
    vm.session.sale = sale;

    moduleStep();

    getSaleDetails(sale).then(function (saleDetails) {
      var detailsRequest = [];
      vm.session.sale.details = saleDetails.data;

      detailsRequest = vm.session.sale.details.map(function (saleItem) {
        return connect.req('/depots/' + vm.session.depot + '/inventory/' + saleItem.inventory_uuid);
      });

      $q.all(detailsRequest)
      .then(function (result) {
        vm.session.sale.details.forEach(function (saleItem, index) {
          var itemModel = result[index];
          if (itemModel.data.length) { saleItem.lots = itemModel; }
        });


        recomendLots(vm.session.sale.details);

        vm.session.lotSelectionSuccess = verifyValidLots(vm.session.sale.details);
      })
      .catch(function (error) {
        messenger.error(error);
      });
    });
  }

  function recomendLots(saleDetails) {
    // Corner cases
    // - ! Lot exists but does not have enough quantity to provide medicine
    // - No lots exist, warning status
    // - ! Lot exists but is expired, stock administrator
    // - Lot exists with both quantity and expiration date

    saleDetails.forEach(function (saleItem) {
      var validUnits = 0;
      var sessionLots = [];

      // Ignore non consumable items
      if (!saleItem.consumable) { return; }

      // Check to see if any lots exist (expired stock should be run through the stock loss process)
      if (!saleItem.lots) {
        saleItem.stockStatus = stock.NONE;
        return;
      }

      // If lots exist, order them by experiation and quantity
      saleItem.lots.data.sort(orderLotsByUsability);
      saleItem.lots.recalculateIndex();

      // Iterate through ordered lots and determine if there are enough valid units
      saleItem.lots.data.forEach(function (lot) {
        var expired = new Date(lot.expiration_date) < new Date();

        if (!expired) {

          var unitsRequired = saleItem.quantity - validUnits;

          if (unitsRequired > 0) {
            // Add lot to recomended lots
            var lotQuantity = (lot.quantity > unitsRequired) ? unitsRequired : lot.quantity;
            sessionLots.push({details : lot, quantity : lotQuantity});
            validUnits += lotQuantity;
          }
        } else {
          messenger.danger('Lot ' + lot.lot_number + $translate.instant('DISTRIBUTION.HAS_EXPIRED'), true);
        }
      });

      if (validUnits < saleItem.quantity) {
        saleItem.stockStatus = stock.LIMITED_STOCK;
      }

      if (sessionLots.length) { saleItem.recomendedLots = sessionLots; }
    });
  }

  function orderLotsByUsability(a, b) {
    // Order first by expiration date, then by quantity
    var aDate = new Date(a.expirationDate),
        bDate = new Date(b.expirationDate);

    if (aDate === bDate) {
      return (a.quantity < b.quantity) ? -1 : (a.quantity > b.quantity) ? 1 : 0;
    }

    return (aDate < bDate) ? -1 : 1;
  }

  function verifyValidLots(saleDetails) {
    var invalidLots = false;

    //Ensure each item has a lot
    invalidLots = saleDetails.some(function (item) {
      // ignore non consumables (FIXME better way tod do this across everything)
      if (!item.consumable) { return false; }

      // FIXME hack - if a status has been reported, cannot be submitted
      if (item.stockStatus) { return true; }
    });

    // Update on failed attempt - EVERY validation
    vm.session.lotSelectionFailure = invalidLots;
    return !invalidLots;
  }

  function getSaleDetails(sale) {
    var query = {
      tables : {
        sale_item : {
          columns : ['sale_uuid', 'uuid', 'inventory_uuid', 'quantity', 'transaction_price']
        },
        inventory : {
          columns : ['code', 'text', 'consumable', 'purchase_price']
        }
      },
      where : ['sale_item.sale_uuid=' + sale.inv_po_id],
      join : ['sale_item.inventory_uuid=inventory.uuid']
    };

    return connect.req(query);
  }

  function getLotPurchasePrice(tracking_number) {
    var query = {
      tables : {
        stock : { columns : ['lot_number'] },
        purchase : { columns : ['cost'] },
        purchase_item : { columns : ['unit_price'] }
      },
      join : [
        'stock.purchase_order_uuid=purchase.uuid',
        'purchase.uuid=purchase_item.purchase_uuid',
        'stock.inventory_uuid=purchase_item.inventory_uuid'
      ],
      where : ['stock.tracking_number=' + tracking_number]
    };

    return connect.req(query);
  }

  function submitConsumption() {
    var submitItem = [];
    var consumption_patients = [];
    if (!vm.session.lotSelectionSuccess) { return messenger.danger('Cannot verify lot allocation'); }

    vm.session.sale.details.forEach(function (consumptionItem) {
      if (!angular.isDefined(consumptionItem.recomendedLots)) { return; }

      consumptionItem.recomendedLots.forEach(function (lot) {
        var consumption_uuid = uuid();

        submitItem.push({
          uuid : consumption_uuid,
          depot_uuid : vm.session.depot,
          date : util.convertToMysqlDate(new Date()),
          document_id : consumptionItem.sale_uuid,
          tracking_number : lot.details.tracking_number,
          unit_price : null,
          quantity : lot.quantity
        });

        consumption_patients.push({
          uuid : uuid(),
          consumption_uuid : consumption_uuid,
          sale_uuid : vm.session.sale.inv_po_id,
          patient_uuid : vm.session.patient.uuid
        });
      });
    });

    function updateLotPrice() {
      var def = $q.defer(),
          counter = 0;

      submitItem.forEach(function (item) {
        getLotPurchasePrice(item.tracking_number)
        .then(function (price) {
          item.unit_price = price.data[0].unit_price;
          counter++;
          if (counter === submitItem.length) {
            def.resolve(submitItem);
          }
        });
      });

      return def.promise;
    }

    updateLotPrice()
    .then(function (resultSubmitItem) {
      return connect.post('consumption', resultSubmitItem);
    })
    .then(function () {
      return connect.post('consumption_patient', consumption_patients);
    })
    .then(function (res) {
      return connect.fetch('/journal/distribution_patient/' + vm.session.sale.inv_po_id);
    })
    .then(function () {
      $location.path('/invoice/consumption/' + vm.session.sale.inv_po_id);
    })
    .catch(function (error) {
      messenger.error(error);
    });
  }

  vm.selectSale = selectSale;
  vm.initialiseDistributionDetails = initialiseDistributionDetails;
  vm.submitConsumption = submitConsumption;
}
