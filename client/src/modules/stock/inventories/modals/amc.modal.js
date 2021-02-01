angular.module('bhima.controllers')
  .controller('StockAMCModalController', StockAMCModalController);

StockAMCModalController.$inject = [
  'StockService', 'NotifyService', '$uibModalInstance', 'data',
];

function StockAMCModalController(Stock, Notify, Instance, data) {
  const vm = this;

  vm.loading = true;

  console.log('quantity:', data.quantity);

  vm.close = () => Instance.dismiss();

  Stock.inventories.loadAMCForInventory(data.inventory_uuid, data.depot_uuid)
    .then(items => {
      vm.data = items;

      vm.settings = vm.data.settings;
      vm.inventory = items.inventory;
      vm.depot = items.depot;

      vm.data.avg_consumption = vm.data[vm.settings.average_consumption_algo];

      console.log('vm.data.quantity_in_stock:', vm.data.quantity_in_stock);

      // calculate date when the stock will run out at current consumption rate
      //

      // nicer aliases to use in the HTML
      vm.isAlgo1 = vm.settings.average_consumption_algo === 'algo1';
      vm.isAlgo2 = vm.settings.average_consumption_algo === 'algo2';
      vm.isAlgo3 = vm.settings.average_consumption_algo === 'algo3';
      vm.isAlgo4 = vm.settings.average_consumption_algo === 'algo_msh';
    })
    .catch(Notify.handleError)
    .finally(() => { vm.loading = false; });

}
