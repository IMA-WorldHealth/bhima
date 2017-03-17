angular.module('bhima.controllers')
.controller('SearchLotsModalController', SearchLotsModalController);

// dependencies injections
SearchLotsModalController.$inject = [
  'DepotService', 'InventoryService', 'NotifyService', '$uibModalInstance', 'SearchFilterFormatService'
];

function SearchLotsModalController(Depots, Inventory, Notify, Instance, SearchFilterFormat) {
  var vm = this;

  // gloabal variables 
  var noMissingDatePart;

  // global methods
  vm.validate = validate;
  vm.cancel = Instance.close;
  vm.submit = submit;

  // init 
  init();

  // load depots 
  Depots.read()
  .then(function (depots) {
      vm.depots = depots;
  })
  .catch(Notify.handleError);

  // load inventories 
  Inventory.read()
  .then(function (inventories) {
      vm.inventories = inventories;
  })
  .catch(Notify.handleError);

  function init() {
    vm.bundle = { 
      entry_date_from: new Date(), 
      entry_date_to: new Date(),
      expiration_date_from: new Date(),
      expiration_date_to: new Date()
    };
    validate();
  }

  function submit() {
    var params = SearchFilterFormat.formatFilter(vm.bundle, true);
    Instance.close(params);
  }

  function validate() {
    noMissingDatePart = (vm.bundle.entry_date_from && vm.bundle.entry_date_to) || (!vm.bundle.entry_date_from && !vm.bundle.entry_date_to);
    vm.validDateRange = noMissingDatePart ? true : false;
  }

}
