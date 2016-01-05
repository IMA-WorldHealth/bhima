var DonationManagementController = function ($q, $translate, $location, $routeParams, validate, connect, messenger, Store, uuid, util, Appcache, Session) {
  var vm = this, cache = new Appcache('donation'), dependencies = {};
  vm.session = {
    user : Session.user,
    project : Session.project,
    enterprise : Session.enterprise,
    date : new Date(),
    maxdate : new Date(),
    donation : {},
    donation_items : [],
    configured : false,
    reviewed : false,
    total : 0,
    donor : null,
    employee : null,
    depot : null,
    step : null
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
        inventory_group : { columns : ['stock_account', 'donation_account'] },
      },
      join : ['inventory_group.uuid=inventory.group_uuid'],
      where : ['inventory_group.donation_account<>null','AND','inventory_group.stock_account<>null']
    }
  };

  dependencies.donors = {
    query : {
      tables : {
        donor : { columns : ['id', 'name']}
      }
    }
  };

  dependencies.employees = {
    query : {
      tables : {
        employee : { columns : ['id', 'code', 'prenom', 'name', 'postnom', 'creditor_uuid']}
      }
    }
  };

  validate.process(dependencies).then(startup).catch(error);

  function testContuity (){
    if (angular.isDefined($routeParams.depotId)) {
      vm.session.depot = { uuid : $routeParams.depotId };
    }else{
      messenger.error($translate.instant('UTIL.NO_DEPOT_SELECTED'), true);
      return;
    }
  }

  function startup (models) {
    angular.extend(vm, models);
    vm.session.depot = vm.depots.get(vm.session.depot.uuid);
    vm.session.configured = true;
    addDonationItem();
  }

  function addDonationItem () {
    var item = new DonationItem();
    vm.session.donation_items.push(item);
  }

  function DonationItem() {
    var self = this;
    this.quantity = 0;
    this.code = null;
    this.inventory_uuid = null;
    this.purchase_price = null;
    this.text = null;
    this.note = null;
    this.sum = 0;
    this.set = set;

    function set(inventoryReference) {
      self.quantity = self.quantity || 0;
      self.code = inventoryReference.code;
      self.text = inventoryReference.text;
      self.purchase_price = Number(inventoryReference.purchase_price.toFixed(4));
      self.inventory_uuid = inventoryReference.uuid;
      self.note = '';
      self.isSet = true;
    }

    return this;
  }

  function updateDonationItem (donationItem, inventoryReference) {
    if (donationItem.inventoryReference){
      vm.inventory.post(donationItem.inventoryReference);
      vm.inventory.recalculateIndex();
    }

    donationItem.set(inventoryReference);
    donationItem.inventoryReference = inventoryReference;
    vm.inventory.remove(inventoryReference.uuid);
    vm.inventory.recalculateIndex();
  }

  function removeDonationItem (index) {
    var currentItem = vm.session.donation_items[index];

    if (currentItem.inventoryReference) {
      vm.inventory.post(currentItem.inventoryReference);
      vm.inventory.recalculateIndex();
    }
    vm.session.donation_items.splice(index, 1);
  }

  function isValidLine (donationItem) {
    if(
      angular.isDefined(donationItem.code) &&
      angular.isDefined(donationItem.purchase_price) &&
      donationItem.purchase_price > 0 &&
      donationItem.quantity > 0
    ){
      donationItem.isValidStock = true;
      updateTotal();
    }else{
      donationItem.isValidStock = false;
    }
  }

  function updateTotal () {
    vm.session.total = vm.session.donation_items.reduce(function (a, b){ return a + b.quantity * b.purchase_price; }, 0);
  }

  function isPassed (){
    if(vm.session.donation_items.length === 0) {return false;}
    return vm.session.donation_items.every(function (item){
      return item.isValidStock === true;
    });
  }

  function isAllPassed (){
    return vm.session.donation_items.every(function (item){
      return item.isValid === true;
    });
  }

  function nextStep() {

    vm.session.donation_items.forEach(function (di){
      angular.extend(di, { isCollapsed : false });
      di.lots = new Store({ identifier : 'tracking_number', data : [] });
      addLot(di);
    });

    vm.session.step = 'input_inventories';
  }

  function Lot () {
    this.inventory_uuid = null;
    this.lot_number = null;
    this.purchase_order_uuid = null;
    this.quantity = 0;
    this.tracking_number = uuid();
    this.date = new Date();
    this.expiration_date = new Date();
  }

  function addLot(di){
    var lot = new Lot();
    lot.code = di.code;
    lot.inventory_uuid = di.inventory_uuid;
    di.lots.post(lot);
    validateDonationLine(di);
    return di;
  }

  function removeLot (don, idx) {
    don.lots.data.splice(idx, 1);
    validateDonationLine(don);
  }

  function error (err) {
    messenger.danger(JSON.stringify(err));
  }

  function validateDonationLine (don){
    var cleaned = true;
    don.sum = don.lots.data.reduce(function (a, b){ return a + b.quantity; }, 0);

    for (var i = don.lots.data.length - 1; i >= 0; i--) {
      var donation = don.lots.data[i];
      if(donation.lot_number === '' || donation.lot_number == null || donation.quantity <= 0 || donation.expiration_date <= vm.session.date){
        cleaned = false;
        break;
      }
    }
    don.isValid = (cleaned && don.sum === don.quantity);
  }

  function review () {
    vm.session.reviewed = true;
  }

  function simulatePurchase() {
    return {
      uuid          : uuid(),
      cost          : vm.session.total,
      purchase_date : util.sqlDate(vm.session.date),
      currency_id   : vm.session.enterprise.currency_id,
      creditor_uuid : null,
      purchaser_id  : vm.session.employee.id,
      project_id    : vm.session.project.id,
      note          : 'DONATION ' + vm.session.donor.name + '/' + util.sqlDate(vm.session.date),
      receiver_id   : vm.session.employee.id,
      emitter_id    : vm.session.user.id,
      paid          : 0,
      confirmed     : 0,
      closed        : 0,
      is_donation   : 1,
      is_direct     : 0
    };
  }

  function getPurchaseItem(purchase_uuid){
    var items = [];
    vm.session.donation_items.forEach(function (di){
      var item = {
        uuid           : uuid(),
        purchase_uuid  : purchase_uuid,
        inventory_uuid : di.inventory_uuid,
        quantity       : di.quantity,
        unit_price     : di.purchase_price,
        total          : di.quantity * di.purchase_price
      };
      items.push(item);
    });
    return items;
  }

  function getStocks(purchase_uuid) {
    var stocks = [];
    vm.session.donation_items.forEach(function (item) {
      var currents = [];
      item.lots.data.forEach(function (lot){
        var stock = {
          tracking_number      : lot.tracking_number,
          lot_number           : lot.lot_number,
          inventory_uuid       : item.inventory_uuid,
          entry_date           : util.sqlDate(new Date()),
          quantity             : lot.quantity,
          expiration_date      : util.sqlDate(lot.expiration_date),
          purchase_order_uuid  : purchase_uuid
        };

        currents.push(stock);
      });
      stocks = stocks.concat(currents);
    });
    return stocks;
  }

  function createMovements (stocks, document_id) {
    var movements = [];
    stocks.forEach(function (stock) {
      var movement = {
        uuid            : uuid(),
        document_id     : document_id,
        tracking_number : stock.tracking_number,
        date            : util.sqlDate(new Date()),
        quantity        : stock.quantity,
        depot_entry     : vm.session.depot.uuid
      };
      movements.push(movement);
    });
    return movements;
  }

  function getDonation(){
    return {
      uuid            : uuid(),
      donor_id        : vm.session.donor.id,
      employee_id     : vm.session.employee.id,
      date            : util.sqlDate(vm.session.date),
      is_received     : 1
    };
  }

  function getDonationItem (stocks, donation_uuid){
    var donation_items = [];
    stocks.forEach(function (stock){
      var di = {
        uuid             : uuid(),
        donation_uuid    : donation_uuid,
        tracking_number  : stock.tracking_number
      };

      donation_items.push(di);
    });

    return donation_items;
  }

  function accept (){
    var document_id = uuid();
    var purchase = simulatePurchase();
    var purchase_items = getPurchaseItem(purchase.uuid);
    var stocks = getStocks(purchase.uuid);
    var movements = createMovements(stocks, document_id);
    var donation = getDonation();
    var donation_items = getDonationItem(stocks, donation.uuid);

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
      return connect.post('donations', donation);
    })
    .then(function (){
      var promisses = donation_items.map(function (item){
        return connect.post('donation_item', item);
      });
      return $q.all(promisses);
    })
    .then(function (){
      messenger.success($translate.instant('STOCK.ENTRY.WRITE_SUCCESS'), false);
      return $q.when(1);
    })
    .then(function () {
      $location.path('/stock/donation_management/report/' + document_id);
    })
    .catch(function (err) {
      console.log(err);
      messenger.error('STOCK.ENTRY.WRITE_ERROR');

      messenger.error($translate.instant('STOCK.ENTRY.WRITE_ERROR'), false);

      var stock_ids = stocks.map(function (stock){return stock.tracking_number;});

      connect.delete('movement', 'tracking_number', stock_ids)
      .then(function (){
        return connect.delete('donations', 'tracking_number', stock_ids);
      })
      .then(function (){
        return connect.delete('stock', 'tracking_number', stock_ids);
      })
      .then(function (){
        return connect.delete('purchase', 'uuid', [purchase.uuid]);
      })
      .catch(function (err){console.log('can not remove corrumpted data, inform the admin of system');});
    });
  }

  vm.addDonationItem      = addDonationItem;
  vm.addLot               = addLot;
  vm.accept               = accept;
  vm.isValidLine          = isValidLine;
  vm.isPassed             = isPassed;
  vm.isAllPassed          = isAllPassed;
  vm.nextStep             = nextStep;
  vm.removeDonationItem   = removeDonationItem;
  vm.removeLot            = removeLot;
  vm.review               = review;
  vm.updateDonationItem   = updateDonationItem;
  vm.validateDonationLine = validateDonationLine;
};
DonationManagementController.$inject = [
  '$q', '$translate', '$location', '$routeParams', 'validate', 'connect',
  'messenger', 'store', 'uuid', 'util', 'appcache', 'SessionService'
];

angular.module('bhima.controllers').controller('DonationManagementController', DonationManagementController);
