angular.module('bhima.controllers')
.controller('StockExitController', StockExitController);

// dependencies injections
StockExitController.$inject = [
  'DepotService', 'InventoryService', 'NotifyService',
  'SearchFilterFormatService', 'FluxService', 'bhConstants',
];

function StockExitController(Depots, Inventory, Notify, SearchFilterFormat, Flux, bhConstants) {
  var vm = this;  

  vm.show = function show() {
    console.log('depot: ', vm.depot);
  }
}
