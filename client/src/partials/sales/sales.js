/**
 * TODO Global charges currently don't hit an invetory item || account,
 * no way of tracing this back to a reason for being
 *
 * FIXME State currently relies on random variables, there should be a clear state object that
 * controls and verifies the current state
 *
 * FIXME All sale details are still downloaded on patient select, hidden until service assignment, this should all be reuqested at once - ties in with state
 */
angular.module('bhima.controllers')
.controller('sales', [
  '$scope',
  '$location',
  '$http',
  'validate',
  'connect',
  'messenger',
  'appcache',
  'precision',
  'util',
  'uuid',
  'SessionService',
  function ($scope, $location, $http, validate, connect, messenger, Appcache, precision, util, uuid, Session) {

    var dependencies = {},
        invoice = {},
        inventory = [];

    var recoverCache = new Appcache('sale'),
        priceListSource = [];

    var session = $scope.session = {
      tablock : -1,
      is_distributable : true,
      invoice_date : new Date()
    };

    $scope.project = Session.project;

    var serviceComponent = $scope.serviceComponent = {
      selected : null,
      complete : false
    };

    dependencies.inventory = {
      query: {
        identifier : 'uuid',
        tables: {
          'inventory' : {
            columns: ['uuid', 'code', 'text', 'price', 'group_uuid']
          },
          inventory_group : { columns : ['sales_account', 'stock_account', 'donation_account'] },
        },
        join : ['inventory_group.uuid=inventory.group_uuid'],
        where : ['inventory_group.sales_account<>null']
      }
    };

    dependencies.services = {
      query: {
        identifier : 'id',
        tables: {
          'service' : {
            columns: ['id', 'name']
          }
        }
      }
    };

    recoverCache.fetch('session')
    .then(processRecover);

    function sales (model) {
      $scope.model = model;
      $scope.inventory = inventory = model.inventory.data;
    }

    validate.process(dependencies).then(sales);

    function assignService() {
      var selectedService = serviceComponent.selected;

      if (!selectedService) { return messenger.danger('No service selected'); }
      invoice.service = selectedService;
    }

    function initialiseSaleDetails(selectedDebtor) {
      if (!selectedDebtor) { return messenger.danger('No invoice debtor selected'); }

      // Release previous session items - if they exist
      if (invoice.items) {
        invoice.items.forEach(function (item, index) {
          if (item.code) {
            removeInvoiceItem(index);
          }
        });
      }

      buildInvoice(selectedDebtor);

      // Uncommented patientGroupList - ALL other lists should import price lists from BOTH
      // patientGroupList and debtorGroupList (renamed from priceList)
      dependencies.patientGroupList = {
        query : {
          tables : {
            assignation_patient : {columns : ['patient_group_uuid', 'patient_uuid']},
            patient_group : {columns : ['note']},
            price_list : {columns : ['title']},
            price_list_item : {columns : ['value', 'is_discount', 'is_global', 'description', 'inventory_uuid']}
          },
          join : [
            'assignation_patient.patient_group_uuid=patient_group.uuid',
            'patient_group.price_list_uuid=price_list.uuid',
            'price_list_item.price_list_uuid=price_list.uuid'
          ],
          where : [
            'assignation_patient.patient_uuid=' + selectedDebtor.uuid
          ]
        }
      };

      dependencies.debtorGroupList = {
        query : {
          tables : {
            price_list: { columns : ['uuid', 'title'] },
            price_list_item : { columns : ['value', 'is_discount', 'is_global', 'description', 'inventory_uuid'] }
          },
          join : ['price_list_item.price_list_uuid=price_list.uuid'],
          where : ['price_list.uuid=' + selectedDebtor.price_list_uuid]
        }
      };

      dependencies.patientApplyableSubsidyList = {
        query : {
          tables : {
            assignation_patient : {columns : ['patient_uuid', 'patient_group_uuid']},
            patient_group : {columns : ['note', 'subsidy_uuid']},
            subsidy : {columns : ['text', 'value', 'is_percent', 'debitor_group_uuid']},
            debitor_group : {columns : ['account_id']}
          },
          join : [
            'assignation_patient.patient_group_uuid=patient_group.uuid',
            'patient_group.subsidy_uuid=subsidy.uuid',
            'subsidy.debitor_group_uuid=debitor_group.uuid'
          ],
          where : [
            'assignation_patient.patient_uuid=' + selectedDebtor.uuid
          ]
        }
      };

      priceListSource = ['patientGroupList', 'debtorGroupList'];
      validate.refresh(dependencies, priceListSource).then(processPriceList);
    }

    function buildInvoice(selectedDebtor) {
      invoice = {
        debtor : selectedDebtor,
        uuid : uuid(),
        date : session.invoice_date,
        items: []
      };

      getCaution(selectedDebtor)
      .then(function (caution){
        if (caution.length > 0){
          var somdebit = 0, somcredit = 0;
          caution.forEach(function(item){
            somdebit = precision.add(precision.scale(item.debit),somdebit);
            somcredit = precision.add(precision.scale(item.credit),somcredit);
          });

          var debitorCaution = (precision.unscale(somcredit) - precision.unscale(somdebit));
          invoice.debitorCaution = debitorCaution;
        }

        if (session.recovering) {
          recover();
        } else {
          addInvoiceItem();
          session.recovered = null;
        }
        // session.recovering ? recover() : addInvoiceItem();

        invoice.note = formatNote(invoice);
        invoice.displayId = invoice.uuid.substr(0, 13);
        $scope.invoice = invoice;

      });

    }

    function getCaution(selectedDebtor) {
      return connect.fetch('/caution/' + selectedDebtor.debitor_uuid + '/' + $scope.project.id);
    }

    function processPriceList(model) {
      invoice.priceList = [];

      // Flattens all price lists fow now, make parsing later simpler
      priceListSource.forEach(function (priceListKey) {
        var priceListData = model[priceListKey].data.sort(sortByOrder);

        priceListData.forEach(function (priceListItem) {
          invoice.priceList.push(priceListItem);
        });
        // invoice.priceList.push(priceListData.sort(sortByOrder));
      });

      // var debtorList = model.debtorGroupList.data;
      // var patientList = model.patientGroupList.data;
      // invoice.priceList = priceLists.sort(function (a, b) { (a.item_order===b.item_order) ? 0 : (a.item_order > b.item_order ? 1 : -1); });
      invoice.applyGlobal = [];

      invoice.priceList.forEach(function (listItem) {
        if (listItem.is_global) {
          invoice.applyGlobal.push(listItem);
        }
      });

      validate.refresh(dependencies, ['patientApplyableSubsidyList']).then(processPatientApplyableSubsidy);
    }

    function processPatientApplyableSubsidy (model) {
      invoice.applyableSubsidies = [];
      model.patientApplyableSubsidyList.data.forEach(function (subsidy) {
        invoice.applyableSubsidies.push(subsidy);
      });
    }

    function sortByOrder(a, b) {
      // FIXME : What does this even do?
      return a.item_order === b.item_order ? 0 : (a.item_order > b.item_order) ? 1 : -1;
    }

    //TODO split inventory management into a seperate controller
    function addInvoiceItem() {
      var item = new InvoiceItem();

      invoice.items.push(item);
      return item;
    }

    //TODO rename legacy (previous) reference from inventoryReference
    function updateInvoiceItem(invoiceItem, inventoryReference) {
      if (invoiceItem.inventoryReference) {
        $scope.model.inventory.post(invoiceItem.inventoryReference);
        $scope.model.inventory.recalculateIndex();
      }

      invoiceItem.set(inventoryReference);
      invoiceItem.inventoryReference = inventoryReference;

      //Remove ability to select the option again
      $scope.model.inventory.remove(inventoryReference.uuid);

      $scope.model.inventory.recalculateIndex();

      // Do not update the recovery object for items added during recovery
      if (!session.recovering) {
        updateSessionRecover();
      }
    }

    function removeInvoiceItem(index) {
      var selectedItem = invoice.items[index];

      if (selectedItem.inventoryReference) {
        $scope.model.inventory.post(selectedItem.inventoryReference);
        $scope.model.inventory.recalculateIndex();
      }

      invoice.items.splice(index, 1);

      // Do not update the recovery object for items added during recovery
      if (!session.recovering) {
        updateSessionRecover();
      }
    }

    function submitInvoice() {
      var invoiceRequest = packageInvoiceRequest();

      if (!validSaleProperties(invoiceRequest)) { return; }
      $http.post('sale/', invoiceRequest).then(handleSaleResponse); // FIXME: refactor to using connect
    }

    function packageInvoiceRequest() {
      var requestContainer = {};


      //Seller ID will be inserted on the server
      requestContainer.sale = {
        project_id       : $scope.project.id,
        cost             : calculateTotal().total,
        currency_id      : Session.enterprise.currency_id,
        debitor_uuid     : invoice.debtor.debitor_uuid,
        invoice_date     : util.sqlDate(session.invoice_date),
        note             : invoice.note,
        service_id       : invoice.service.id,
        is_distributable : session.is_distributable
      };

      requestContainer.saleItems = [];

      invoice.items.forEach(function(saleItem) {
        var formatSaleItem;
        formatSaleItem = {
          inventory_uuid    : saleItem.inventoryId,
          quantity          : saleItem.quantity,
          inventory_price   : saleItem.inventoryReference.price,
          transaction_price : saleItem.price,
          credit            : Number((saleItem.price * saleItem.quantity).toFixed(4)),
          debit             : 0
        };

        requestContainer.saleItems.push(formatSaleItem);
      });

      var sale_cost = requestContainer.sale.cost;
      requestContainer.applyableSaleSubsidies = [];

      invoice.applyableSubsidies.forEach(function (subsidy) {
        var amount = subsidy.is_percent ? (sale_cost * subsidy.value) / 100 : subsidy.value;
        var applyableSubsidy = {
          uuid : subsidy.subsidy_uuid,
          value : amount
        };
        requestContainer.applyableSaleSubsidies.push(applyableSubsidy);
      });

      invoice.applyGlobal.forEach(function (listItem) {

        var formatDiscountItem = {
          inventory_uuid : listItem.inventory_uuid,
          quantity : 1,
          transaction_price : listItem.currentValue,
          debit : 0,
          credit : 0,
          inventory_price : 0
        };

        formatDiscountItem[listItem.is_discount ? 'debit' : 'credit'] = listItem.currentValue;

        requestContainer.saleItems.push(formatDiscountItem);
      });

      requestContainer.caution = (invoice.debitorCaution)? invoice.debitorCaution : 0;

      return requestContainer;
    }

    function handleSaleResponse(result) {
      recoverCache.remove('session');
      $location.path('/invoice/sale/' + result.data.saleId);
    }

    function validSaleProperties(saleRequest) {
      var saleItems = saleRequest.saleItems;

      //Check sale item properties
      if (saleItems.length===0) {
        messenger.danger('[Invalid Sale] No sale items found');
        return false;
      }

      var invalidItems = saleItems.some(function(saleItem) {
        for (var property in saleItem) {
          if (angular.isUndefined(saleItem[property]) || saleItem[property] === null) { return true; }
        }
        if (isNaN(Number(saleItem.quantity))) { return true; }
        if (isNaN(Number(saleItem.transaction_price))) { return true; }
        return false;
      });

      if (invalidItems) {
        messenger.danger('[Invalid Sale] Sale items contain null values');
        return false;
      }
      return true;
    }

    //Utility methods
    function getDate() {
      //Format the current date according to RFC3339
      var currentDate = new Date();
      return currentDate.getFullYear() + '-' + (currentDate.getMonth() + 1) + '-' + ('0' + currentDate.getDate()).slice(-2);
    }

    function formatNote(invoice) {
      var noteDebtor = invoice.debtor || '';
      return $scope.project.abbr + '_VENTE/' + invoice.date + '/' + noteDebtor.name;
    }

    //TODO Refactor code
    function calculateTotal(includeDiscount) {
      var total = 0;
      includeDiscount = angular.isDefined(includeDiscount) ? includeDiscount : true;

      if (!invoice.items) { return; }
      invoice.items.forEach(function(item) {
        if (item.quantity && item.price && item.code) {
          //FIXME this could probably be calculated less somewhere else (only when they change)

          total += (item.quantity * item.price);

          total = Number(total.toFixed(4));
        }
      });

      if (invoice.applyGlobal) {
        invoice.applyGlobal.forEach(function (listItem) {
          listItem.currentValue = Number(((total * listItem.value) / 100).toFixed(4));

          if (listItem.is_discount) {
            total -= listItem.currentValue;
          } else {
            total += listItem.currentValue;
          }

          total = Number(total.toFixed(4));
        });
      }
      var totalToPay;

      // Apply caution
      if (invoice.debitorCaution){
        // var remaining = 0;
        // remaining = total - invoice.debitorCaution;
        // totalToPay = remaining < 0 ? 0 : remaining;
        // totalToPay = Number(totalToPay.toFixed(4));
        totalToPay = total;
      }else{
        totalToPay = total;
      }

      return {total : total, totalToPay : totalToPay};

      // return total;
    }

    $scope.isPayable = function() {
      return $scope.invoice.payable === 'true';
    };

    $scope.itemsInInv = function() {
      return $scope.inventory.length > 0;
    };

    //TODO clean up invoice item set properties
    function InvoiceItem() {
      var self = this;

      function set(inventoryReference) {
        var defaultPrice = inventoryReference.price;

        self.quantity = self.quantity || 1;
        self.code = inventoryReference.code;
        self.text = inventoryReference.text;

        // FIXME naive rounding - ensure all entries/ exits to data are rounded to 4 DP
        self.price = Number(inventoryReference.price.toFixed(4));
        self.inventoryId = inventoryReference.uuid;
        self.note = '';

        // Temporary price list logic
        if (invoice.priceList) {
          invoice.priceList.forEach(function (list) {

            if (!list.is_global) {
              if (list.is_discount) {
                self.price -= Math.round((defaultPrice * list.value) / 100);

                // FIXME naive rounding - ensure all entries/ exits to data are rounded to 4 DP
                self.price = Number(self.price.toFixed(4));
              } else {
                var applyList = (defaultPrice * list.value) / 100;
                self.price += applyList;

                // FIXME naive rounding - ensure all entries/ exits to data are rounded to 4 DP
                self.price = Number(self.price.toFixed(4));
              }
            }
          });
        }

        self.isSet = true;
      }

      this.quantity = 0;
      this.code = null;
      this.inventoryId = null;
      this.price = null;
      this.text = null;
      this.note = null;
      this.set = set;

      return this;
    }

    function processRecover(recoveredSession) {
      if (!session) { return; }
      $scope.session.recovered = recoveredSession;
    }

    function selectRecover() {
      $scope.session.recovering = true;

      // FIXME
      // This is a cheeky way to refresh the session by changing a value
      // the find-patient directive is looking for.
      $scope.session.findPatientId = $scope.session.recovered.patientId;

      serviceComponent.selected = $scope.session.recovered.service;
      assignService();
    }

    // recover a patient's sale
    function recover() {

      invoice.service = $scope.session.recovered.service || null;

      $scope.session.recovered.items.forEach(function (item) {
        var currentItem = addInvoiceItem(), invItem = $scope.model.inventory.get(item.uuid);
        currentItem.selectedReference = invItem.code;
        updateInvoiceItem(currentItem, invItem);
        currentItem.quantity = item.quantity;
      });

      session.is_distributable = session.recovered.is_distributable;
      session.invoice_date = session.recovered.invoice_date;

      // FIXME this is stupid
      // @sfount -- jeez man, no need to be so hard on yourself.
      session.displayRecover = true;

      session.recovering = false;
      session.recovered = null;
    }

    function updateSessionRecover() {

      //FIXME currently puts new object on every item, this could be improved
      var recoverObject = session.recoverObject || {
        patientId : invoice.debtor.uuid,
        service : invoice.service,
        invoice_date : session.invoice_date,
        is_distributable : session.is_distributable,
        items : []
      };

      invoice.items.forEach(function (item) {
        if (item.code && item.quantity) {
          recoverObject.items.push({
            uuid : item.inventoryId,
            quantity : item.quantity
          });
        }
      });

      recoverCache.put('session', recoverObject);
    }

    function toggleTablock() {
      session.tablock = session.tablock === 0 ? -1 : 0;
    }

    function cacheQuantity(invoiceItem) {

      if (invoiceItem.quantity === '') { return; }
      if (isNaN(Number(invoiceItem.quantity))) { return; }
      updateSessionRecover();
    }

    // Sale verficition first step, disable button until basic criteria are met
    function verifySubmission() {
      var invalidItems = false;

      if (!invoice.items) { return true; }
      if (!invoice.items.length) { return true; }

      // FIXME This is a very expensive operation
      invalidItems = invoice.items.some(function (item) {
        if (!item.code && !item.quantity) { return true; }
      });

      return invalidItems;
    }

    function SelectService () {
      updateSessionRecover();
    }

    $scope.initialiseSaleDetails = initialiseSaleDetails;
    $scope.addInvoiceItem = addInvoiceItem;
    $scope.updateInvoiceItem = updateInvoiceItem;
    $scope.removeInvoiceItem = removeInvoiceItem;
    $scope.submitInvoice = submitInvoice;
    $scope.calculateTotal = calculateTotal;
    $scope.toggleTablock = toggleTablock;
    $scope.selectRecover = selectRecover;
    $scope.cacheQuantity = cacheQuantity;
    $scope.verifySubmission = verifySubmission;

    $scope.assignService = assignService;
    //$scope.SelectService = SelectService;
  }
]);
