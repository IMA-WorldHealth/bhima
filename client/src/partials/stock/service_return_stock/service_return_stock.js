angular.module('bhima.controllers')
.controller('ServiceReturnStockController', ServiceReturnStockController);

ServiceReturnStockController.$inject = [
  '$routeParams', '$http', '$q', '$translate', '$location', 'SessionService',
  'messenger', 'connect', 'uuid', 'validate', 'util'
];

/**
  * Responsible for return medications from service to depot.
  * This is the following steps:
  *   1) Select the service in which there are stock to return
  *   2) Select medications
  *   3) Submission
  *   4) Print a receipt/generate documentation
  *   5) Increase the stock inventory account in the journal by debiting the
  *       stock account and crediting the cost of goods sold account.
  *       indicate the service as cost center in journal
  *
  * @constructor
  * @class ServiceReturnStockController
  */
function ServiceReturnStockController($routeParams, $http, $q, $translate, $location, SessionService, messenger, connect, uuid, validate, util) {
  var vm           = this,
      session      = vm.session = {},
      dependencies = {};

  // dependencies
  dependencies.depots = {
    query : {
      identifier : 'uuid',
      tables : {
        'depot' : {
          columns : ['uuid', 'reference', 'text']
        }
      }
    }
  };

  dependencies.services = {
    query : {
      identifier : 'id',
      tables : {
        'service' : { columns : ['id', 'name', 'cost_center_id'] }
      }
    }
  };

  dependencies.inventory = {
    query : {
      identifier : 'uuid',
      tables : {
        inventory : { columns : ['uuid', 'code', 'text', 'purchase_price', 'type_id', 'group_uuid'] },
        inventory_group : { columns : ['sales_account', 'stock_account'] },
      },
      join : ['inventory_group.uuid=inventory.group_uuid'],
      where : ['inventory_group.stock_account<>null']
    }
  };

  dependencies.employee = {
    query : {
      tables : {
        employee : { columns : ['id', 'code', 'prenom', 'name', 'postnom', 'creditor_uuid']}
      }
    }
  };

  // initialize models
  vm.session.step  = null;
  vm.session.total = 0;
  vm.session.stocks = [];
  vm.session.integrationStarted = false;

  // Expose models to the views
  vm.startingReturnProcess = startingReturnProcess;
  vm.addStockItem = addStockItem;
  vm.removeStockItem = removeStockItem;
  vm.updateStockItem = updateStockItem;
  vm.isValidLine = isValidLine;
  vm.preview = preview;
  vm.isPassed = isPassed;
  vm.goback = goback;
  vm.reset = reset;
  vm.integrate = integrate;

  // start the module up
  startup();

  // Functions definitions
  function startup() {
    if (angular.isUndefined($routeParams.depotId)) {
      messenger.error($translate.instant('UTIL.NO_DEPOT_SELECTED'), true);
      return;
    }
    validate.process(dependencies)
    .then(initialize)
    .catch(error);
  }

  function initialize(models) {
    angular.extend(vm, models);
    vm.session.depot = vm.depots.get($routeParams.depotId);
  }

  function error (err) {
    console.error(err);
    return;
  }

  function startingReturnProcess () {
    if (!vm.service || !vm.service.id) { return; }
    vm.session.step = 'select_inventories';
    vm.session.integrationStarted = true;
    addStockItem();
  }

  function addStockItem () {
    var stock = new StockItem();
    vm.session.stocks.push(stock);
  }

  function StockItem () {
    var self = this;

    this.code = null;
    this.inventory_uuid = null;
    this.text = null;
    this.date = new Date();
    this.lot_number = null;
    this.tracking_number = uuid();
    this.quantity = 0;
    this.purchase_price = 0;
    this.purchase_order_uuid = null;
    this.isValidStock = false;


    this.set = function (inventoryReference) {
      self.inventory_uuid = inventoryReference.uuid;
      self.code = inventoryReference.code;
      self.text = inventoryReference.text;
      self.expiration_date = new Date();
      self.date = new Date();
      self.lot_number = null;
      self.tracking_number = uuid();
      self.purchase_price = inventoryReference.purchase_price || self.purchase_price;
      self.purchase_order_uuid = null;
      self.isSet = true;
    };

    return this;
  }

  function removeStockItem (idx) {
    vm.session.stocks.splice(idx, 1);
    updateTotal();
  }

  function updateStockItem (stockItem, inventoryReference) {
    stockItem.set(inventoryReference);
  }

  function isValidLine (stockItem) {
    if(angular.isDefined(stockItem.code) &&
       angular.isDefined(stockItem.expiration_date) &&
       angular.isDefined(stockItem.lot_number) &&
       angular.isDefined(stockItem.purchase_price) &&
       stockItem.purchase_price > 0 &&
       stockItem.quantity > 0 &&
       stockItem.expiration_date > new Date()
      ){
      stockItem.isValidStock = true;
      updateTotal();
    }else{
      stockItem.isValidStock = false;
    }
  }

  function isPassed (){
    return vm.session.stocks.every(function (item){
      return item.isValidStock === true;
    });
  }

  function preview () {
    vm.session.step = 'preview_inventories';
  }

  function updateTotal (){
    vm.session.total = vm.session.stocks.reduce(function (a, b){ return a + b.quantity * b.purchase_price; }, 0);
  }

  function goback () {
    vm.session.step = 'select_inventories';
  }

  function reset () {
    vm.session.stocks = [];
    vm.session.step = null;
  }

  function simulatePurchase() {
    return {
      uuid          : uuid(),
      cost          : vm.session.total,
      purchase_date : util.sqlDate(new Date()),
      currency_id   : SessionService.enterprise.currency_id,
      creditor_uuid : null,
      purchaser_id  : null,
      emitter_id    : SessionService.user.id,
      project_id    : SessionService.project.id,
      receiver_id   : null,
      note          : 'Service Return Stock/' + vm.service.name + '/' + vm.description + '/' + util.sqlDate(new Date()),
      paid          : 0,
      confirmed     : 0,
      closed        : 0,
      is_integration: 0,
      is_direct     : 0,
      is_return     : 1
    };
  }

  function getPurchaseItem(purchase_uuid){
    var items = [];
    vm.session.stocks.forEach(function (stock){
      var item = {
        uuid           : uuid(),
        purchase_uuid  : purchase_uuid,
        inventory_uuid : stock.inventory_uuid,
        quantity       : stock.quantity,
        unit_price     : stock.purchase_price,
        total          : stock.quantity * stock.purchase_price
      };
      items.push(item);
    });
    return items;
  }

  function getStocks(purchase_uuid) {
    var stocks = [];
    vm.session.stocks.forEach(function (item) {
      var stock = {
        tracking_number      : item.tracking_number,
        lot_number           : item.lot_number,
        inventory_uuid       : item.inventory_uuid,
        entry_date           : util.sqlDate(new Date()),
        quantity             : item.quantity,
        expiration_date      : util.sqlDate(item.expiration_date),
        purchase_order_uuid  : purchase_uuid
      };
      stocks.push(stock);
    });
    return stocks;
  }

  function getMovements (document_id) {
    var movements = [];
    vm.session.stocks.forEach(function (item) {
      var movement = {
        uuid            : uuid(),
        document_id     : document_id,
        tracking_number : item.tracking_number,
        date            : util.sqlDate(new Date()),
        quantity        : item.quantity,
        depot_entry     : vm.session.depot.uuid
      };
      movements.push(movement);
    });
    return movements;
  }

  function integrate () {
    var purchase = simulatePurchase();
    var purchase_items = getPurchaseItem(purchase.uuid);
    var stocks = getStocks(purchase.uuid);
    var document_id = uuid();
    var movements = getMovements(document_id);

    connect.post('purchase', purchase)
    .then(function (){
      var promisses = purchase_items.map(function (item){
        return connect.post('purchase_item', item);
      });
      return $q.all(promisses);
    })
    .then(function (){
      var promisses = stocks.map(function (item){
        return connect.post('stock', item);
      });
      return $q.all(promisses);
    })
    .then(function (){
      var promisses = movements.map(function (item){
        return connect.post('movement', item);
      });
      return $q.all(promisses);
    })
    .then(function () {
      // journal notify return stock from service
      var params = {
        purchase_uuid   : purchase.uuid,
        cost_center_id  : vm.service.cost_center_id
      };

      return $http.get('/journal/service_return_stock/' + JSON.stringify(params));
    })
    .then(function (){
      messenger.success($translate.instant('STOCK.ENTRY.WRITE_SUCCESS'), false);
      return $q.when(1);
    })
    .then(function () {
      $location.path('/stock/entry/report/' + document_id);
    })
    .catch(function (err) {
      // notify error
      messenger.error($translate.instant('STOCK.ENTRY.WRITE_ERROR'), false);
      console.error(err);

      // rollback
      var stock_ids = stocks.map(function (stock){return stock.tracking_number;});
      connect.delete('movement', 'tracking_number', stock_ids).
      then(function (){
        connect.delete('stock', 'tracking_number', stock_ids);
      })
      .then(function (){
        connect.delete('purchase_item', 'purchase_uuid', [purchase.uuid]);
      })
      .then(function (){
        connect.delete('purchase', 'uuid', [purchase.uuid]);
      })
      .catch(function (err){console.log('can not remove corrumpted data, inform the admin of system');});
    });
  }

}
