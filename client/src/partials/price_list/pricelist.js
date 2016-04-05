// TODO Handle HTTP exception errors (displayed contextually on form)
angular.module('bhima.controllers')
.controller('PriceListController', PriceListController);

PriceListController.$inject = [
  'PriceListService', '$window', '$translate', '$uibModal', 'InventoryService'
];

function PriceListController(PriceListService, $window, $translate, $uibModal, Inventory) {
  var vm = this;
  vm.view = 'default';

  // bind methods
  vm.create   = create;
  vm.submit   = submit;
  vm.update   = update;
  vm.del      = del;  
  vm.cancel   = cancel;
  vm.addItem  = addItem;
  vm.getInventory = getInventory;
  vm.removeItem = removeItem;

  function handler(error) {
    console.error(error);
  }

  // fired on startup
  function startup() {
    // start up loading indicator
    vm.loading = true;

    // load Inventory 
    Inventory.getInventoryItems()
    .then(function (data) {
      vm.inventories = data;
    }).catch(handler);

    // load PriceList
    refreshPriceList();
  }

  function cancel() {
    vm.view = 'default';
  }

  function getInventory(uuid) {
    var inventory = vm.inventories.filter(function (item) {
      return item.uuid  === uuid;
    });

    return inventory[0].label;
  }

  function removeItem(item){
    if (vm.pricelistItems.length > 1) {
      vm.pricelistItems.splice(vm.pricelistItems.indexOf(item), 1);
    } else {
      $window.alert($translate.instant('PRICE_LIST.UNABLE_TO_DELETE'));
    }  
  }

  function create() {
    vm.priceList = null;  
    vm.pricelistItems = [];
    vm.view = 'create';
  }

  // switch to update mode
  // data is an object that contains all the information of a priceList
  function update(data) {
    vm.view = 'update';
    vm.priceList = data;

    PriceListService.read(data.uuid)
    .then(function (data) {
      vm.pricelistItems = data.items;
    });

  }

  
  // refresh the displayed PriceList
  function refreshPriceList() {
    return PriceListService.read(null, { detailed : 1 })
    .then(function (data) {
      vm.loading = false;
      vm.priceLists = data;
    });
  }

  // form submission
  function submit(invalid) {
    if (invalid) { return; }

    var promise;
    var creation = (vm.view === 'create');

    vm.priceList.items = vm.pricelistItems.length ? vm.pricelistItems : null;

    var priceList = angular.copy(vm.priceList);


    promise = (creation) ?
      PriceListService.create(priceList) :
      PriceListService.update(priceList.uuid, priceList);

    promise
      .then(function (response) {
        return refreshPriceList();
      })
      .then(function () {
        vm.view = creation ? 'create_success' : 'update_success';
      })      
      .catch(handler);
  }

  // switch to delete warning mode
  function del(priceList) {
    var bool = $window.confirm($translate.instant('FORM.DIALOGS.CONFIRM_DELETE'));

     // if the user clicked cancel, reset the view and return
     if (!bool) {
        vm.view = 'default';
        return;
     }

    // if we get there, the user wants to delete a priceList
    vm.view = 'delete_confirm';
    PriceListService.delete(priceList.uuid)
    .then(function () {
       vm.view = 'delete_success';
       return refreshPriceList();
    })
    .catch(function (error) {
      vm.HTTPError = error;
      vm.view = 'delete_error';
    });
  }

  // Add pricelist Item in a  modal
  function addItem() {
    $uibModal.open({
      templateUrl : 'partials/price_list/modal.html',
      size : 'md',
      animation : true,
      controller : 'PriceListModalController as ModalCtrl'
    }).result
    .then(function (items) {
      vm.pricelistItems.push(items);
    });        
  }

  startup();  
}