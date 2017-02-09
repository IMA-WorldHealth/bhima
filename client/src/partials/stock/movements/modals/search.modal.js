angular.module('bhima.controllers')
.controller('SearchMovementsModalController', SearchMovementsModalController);

// dependencies injections
SearchMovementsModalController.$inject = [
  'DepotService', 'InventoryService', 'NotifyService', '$uibModalInstance', 
  'SearchFilterFormatService', 'FluxService', '$translate'
];

function SearchMovementsModalController(Depots, Inventory, Notify, Instance, SearchFilterFormat, Flux, $translate) {
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

  // load flux 
  Flux.read()
  .then(function (rows) {
      vm.fluxes = rows.map(function (row) {
        row.label = $translate.instant(row.label);
        return row;
      });
  })
  .catch(Notify.handleError);

  function init() {
    vm.bundle = { 
      dateFrom: new Date(),
      dateTo: new Date(),
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
