angular.module('bhima.controllers')
.controller('InventoryDistributionController', InventoryDistributionController);

InventoryDistributionController.$inject = [
  '$scope', 'validate', 'connect', 'messenger', 'appstate',
  'util', 'uuid', '$q'
];

function InventoryDistributionController($scope, validate, connect, messenger, appstate, util, uuid, $q) {
  var distribution = {},
      dependencies = {};

  distribution.visible = true;
  distribution.noEmpty = false;
  distribution.item_records = [];
  distribution.moving_records = [];
  distribution.rows = [];
  distribution.sales = [];

  dependencies.stocks = {
    query : {
      tables : {
        'stock' : {
          columns : ['inventory_uuid', 'expiration_date', 'entry_date', 'lot_number', 'purchase_order_uuid', 'tracking_number', 'quantity']
        },
        'inventory' : {
          columns : ['uuid', 'text', 'enterprise_id', 'code', 'price', 'stock']
        }
      },
      join : ['stock.inventory_uuid=inventory.uuid']
    }
  };

  dependencies.project = {
    required : true,
    query : {
      tables : {
        'project' : {
          columns : ['abbr', 'name']
        }
      }
    }
  };

  dependencies.debitor_group = {
    required : true,
    query : {
      tables : {
        'debitor_group' : {
          columns : ['is_convention', 'name', 'uuid', 'account_id']
        }
      }
    }
  };

  function initialiseDistributionDetails (selectedDebitor) {
    if (!selectedDebitor) { return; }
    distribution.noEmpty = true;
    $scope.ready = 'ready';
    distribution.selectedDebitor = selectedDebitor;
    connect.fetch('/ledgers/distributableSale/' + selectedDebitor.debitor_uuid)
    .then(function (data) {
      data.forEach(function (row) {
        row.reference = getAbbr(row.project_id)+row.reference;
        row.etat = getState(row);
      });
      distribution.sales = data;
    });
  }

  function getAbbr(project_id) {
    return $scope.model.project.data.filter(function (item) {
      return item.id === project_id;
    })[0].abbr;
  }

  function getState(sale) {
    var filtered = $scope.model.debitor_group.data.filter(function (item) {
      return item.account_id === sale.account_id;
    });

    return filtered[0].is_convention === 1 ? 'CONVENTION' : sale.balance > 0 ? 'NON PAYE' : 'PAYE';
  }

  function init(model) {
    //init model
    $scope.model = model;
  }

  function sanitize() {
    distribution.rows = $scope.selectedSale.sale_items;

    distribution.item_records = distribution.rows.map(function (it) {
      it.consumption_infos = [];
      var q = it.quantity;
      distribution.records = it.lots.map(function (lot) {
        var record;
        if (lot.setted) {
          if (q>0) {
            var amount;
            if (q-lot.quantity>0) {
              q-=lot.quantity;
              amount = lot.quantity;
              lot.current_quantity = 0;
            }else{
              amount = q;
              lot.current_quantity = lot.quantity - q;
              q=0;
            }
            record = {
              document_id : uuid(),
              tracking_number : lot.tracking_number,
              date : util.sqlDate(new Date().toString()),
              depot_id : 1,
              amount : amount,
              sale_uuid : $scope.selectedSale.inv_po_id
            };
            it.consumption_infos.push(record);
            return record;
          }
        }
      });

      distribution.records = distribution.records.filter(function (item) {
        return !!item;
      });
      return;
    });

    distribution.moving_records = distribution.rows.map(function (it) {
      distribution.records = it.consumption_infos.map(function (consumption_info) {
        return {
          document_id : uuid(),
          tracking_number : consumption_info.tracking_number,
          direction : 'Exit',
          date : util.sqlDate(new Date().toString()),
          quantity : consumption_info.amount,
          depot_id : 1, //for now
          destination :1 //for patient
        };
      });
      return;
    });
  }

  function submit () {
    sanitize();
    if (stockAvailability()) {
      doConsumption()
      .then(doMoving)
      //.then(decreaseStock)
      .then(function (result) {
        console.log('[result ...]', result);
      });
    } else {
      messenger.danger('Le stock dans le (s) lot (s) selectionne (s) n\'est pas disponible pour convrir la quantite demandee');
    }
  }

  function doConsumption() {
    return $q.all(
      distribution.item_records.map(function (item_record) {
        return connect.post('consumption', item_record);
      })
    );
  }

  function doMoving() {
    return $q.all(
      distribution.moving_records.map(function (moving) {
        return connect.post('stock_movement', moving);
      })
    );
  }

  function add(idx) {
    if ($scope.selectedSale) { return; }
    $scope.selectedSale =  $scope.distribution.sales.splice(idx, 1)[0];
    dependencies.sale_items = {
      required : true,
      query : {
        tables : {
          'sale_item' : {columns : ['uuid', 'inventory_uuid', 'quantity']},
          'inventory' : {columns : ['code', 'text', 'stock']}
        },
        join  : ['sale_item.inventory_uuid=inventory.uuid'],
        where : ['sale_item.sale_uuid='+$scope.selectedSale.inv_po_id]
      }
    };
    validate.process(dependencies, ['sale_items'])
    .then(initialiseProcess);
  }

  function remove() {
    $scope.distribution.sales.push($scope.selectedSale);
    $scope.selectedSale= null;
    $scope.selected = 'null';
  }

  function initialiseProcess(model) {
    var filtered;
    $scope.selected = 'selected';
    filtered = model.sale_items.data.filter(function (item) {
      return item.code.substring(0,1) !== '8';
    });
    filtered.forEach(function (it) {
      it.tracking_number = null;
      it.avail = (it.quantity <= it.stock) ? 'YES' : 'NO';
    });
    $scope.selectedSale.sale_items = filtered;

    $scope.selectedSale.sale_items.forEach(function (sale_item) {
      connect.fetch('/lot/' + sale_item.inventory_uuid)
      .then(function (lots) {
        if (!lots.length) {
          distribution.hasLot = false;
          messenger.danger('Pas de lot recuperes');
          return;
        }

        distribution.hasLot = true;

        if (lots.length && lots.length === 1) {
          lots[0].setted = true;
          sale_item.lots = lots;
          return;
        }

        var tapon_lot;
        for (var i = 0; i < lots.length -1; i++) {
          for (var j = i+1; j < lots.length; j++) {
            if (util.isDateAfter(lots[i].expiration_date, lots[j].expiration_date)) {
              tapon_lot = lots[i];
              lots[i] = lots[j];
              lots[j] = tapon_lot;
            }
          }
        }

        var som = 0;
        lots.forEach(function (lot) {
          som += lot.quantity;
          if (sale_item.quantity > som) {
            lot.setted = true;
          } else {
            if (som - lot.quantity < sale_item.quantity) { lot.setted = true; }
          }
        });
        sale_item.lots = lots;
      })
      .catch(handleError);
    });
  }

  function verifySubmission() {
    if (!distribution.hasLot) { return true; }
    if ($scope.selectedSale) {
      if ($scope.selectedSale.sale_items) {
        var availability = $scope.selectedSale.sale_items.some(function (saleItem) {
          return saleItem.avail === 'NO';
        });

        return availability || false;
      } else {
        return true;
      }
    }
  }

  function handleError() {
    messenger.danger('impossible de recuperer des lots !');
  }

  function resolve() {
    return !$scope.ready;
  }

  function stockAvailability() {
    var result =  $scope.selectedSale.sale_items.some(function (si) {
      var q = 0;
      si.lots.forEach(function (lot) {
        if (lot.setted) { q += lot.quantity; }
      });
      return si.quantity > q;
    });
    return !result;
  }

  appstate.register('project', function (project) {
    $scope.project = project;
    validate.process(dependencies)
    .then(init)
    .catch(function (error) {
      console.error(error);
    });
  });

  $scope.distribution = distribution;
  $scope.initialiseDistributionDetails = initialiseDistributionDetails;
  $scope.submit = submit;
  $scope.add = add;
  $scope.remove = remove;
  $scope.resolve = resolve;
  $scope.verifySubmission = verifySubmission;
  $scope.stockAvailability = stockAvailability;
}
