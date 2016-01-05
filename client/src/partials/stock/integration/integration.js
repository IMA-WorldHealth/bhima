var stockIntegration = function ($q, $translate, $location, $routeParams, validate, connect, messenger, uuid, util, Appcache, Session) {

  var vm = this, cache = new Appcache('integration'), dependencies = {};

  vm.session = {
    total : 0,
    depot : null,
    project : Session.project,
    user : Session.user,
    step : null,
    stocks : [],
    integrationStarted : false
  };

  testContuity();

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

  validate.process(dependencies).then(startup).catch(error);

  function startup (models) {
    angular.extend(vm, models);
    vm.session.depot = vm.depots.get(vm.session.depot.uuid);
  }

  function error (err) {
    messenger.danger(JSON.stringify(err));
    return;
  }

  function testContuity (){
    if (angular.isDefined($routeParams.depotId)) {
      vm.session.depot = { uuid : $routeParams.depotId };
    }else{
      messenger.error($translate.instant('UTIL.NO_DEPOT_SELECTED'), true);
      return;
    }
  }

  function startIntegration() {
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

  function simulatePurchase() {
    return {
      uuid          : uuid(),
      cost          : vm.session.total,
      purchase_date : util.sqlDate(new Date()),
      currency_id   : Session.enterprise.currency_id,
      creditor_uuid : null,
      purchaser_id  : null,
      emitter_id    : vm.session.user.id,
      project_id    : vm.session.project.id,
      receiver_id   : null,
      note          : 'INTEGRATION_STOCK/' + util.sqlDate(new Date()),
      paid          : 0,
      confirmed     : 0,
      closed        : 0,
      is_integration: 1,
      is_direct     : 0
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
    .then(function (){
      messenger.success($translate.instant('STOCK.ENTRY.WRITE_SUCCESS'), false);
      return $q.when(1);
    })
    .then(function () {
      $location.path('/stock/entry/report/' + document_id);
    })
    .catch(function (err) {
      console.log(err);
      messenger.error($translate.instant('STOCK.ENTRY.WRITE_ERROR'), false);

      var stock_ids = stocks.map(function (stock){return stock.tracking_number;});

      connect.delete('movement', 'tracking_number', stock_ids).
      then(function (){
        return connect.delete('stock', 'tracking_number', stock_ids);
      })
      .then(function (){
        return connect.delete('purchase', 'uuid', [purchase.uuid]);
      })
      .catch(function (err){console.log('can not remove corrumpted data, inform the admin of system');});
    });
  }

  vm.startIntegration = startIntegration;
  vm.addStockItem = addStockItem;
  vm.removeStockItem = removeStockItem;
  vm.updateStockItem = updateStockItem;
  vm.isValidLine = isValidLine;
  vm.preview = preview;
  vm.isPassed = isPassed;
  vm.goback = goback;
  vm.integrate = integrate;
};

stockIntegration.$inject = [
  '$q', '$translate', '$location', '$routeParams', 'validate', 'connect',
  'messenger', 'uuid', 'util', 'appcache', 'SessionService'
];

angular.module('bhima.controllers')
.controller('stockIntegration', stockIntegration);
