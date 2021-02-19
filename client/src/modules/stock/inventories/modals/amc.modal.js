angular.module('bhima.controllers')
  .controller('StockAMCModalController', StockAMCModalController);

StockAMCModalController.$inject = [
  'StockService', 'NotifyService', '$uibModalInstance', 'data', 'moment', 'bhConstants',
];

function StockAMCModalController(Stock, Notify, Instance, data, moment, Constants) {
  const vm = this;

  vm.close = () => Instance.dismiss();

  vm.DATE_FORMAT = Constants.dates.format;

  function startup() {
    vm.loading = true;

    Stock.inventories.loadAMCForInventory(data.inventory_uuid, data.depot_uuid)
      .then(items => {
        vm.data = items;

        vm.settings = vm.data.settings;
        vm.inventory = items.inventory;
        vm.depot = items.depot;

        vm.data.avg_consumption = vm.data[vm.settings.average_consumption_algo];

        // calculate date when the stock will run out at current consumption rate
        // NOTE(@jniles): momentjs does not accept decimals as of 2.12.0.  We need to use days, not
        // months
        const daysOfStockLeft = (vm.data.quantity_in_stock / vm.data.avg_consumption) * 30.5;
        vm.data.stock_out_date = moment().add(daysOfStockLeft, 'days').toDate();

        // nicer aliases to use in the HTML
        vm.isAlgo1 = vm.settings.average_consumption_algo === 'algo1';
        vm.isAlgo2 = vm.settings.average_consumption_algo === 'algo2';
        vm.isAlgo3 = vm.settings.average_consumption_algo === 'algo3';
        vm.isAlgo4 = vm.settings.average_consumption_algo === 'algo_msh';
      })
      .catch(Notify.handleError)
      .finally(() => {
        vm.loading = false;
      });
  }

  startup();
}
