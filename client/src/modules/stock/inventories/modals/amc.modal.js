angular.module('bhima.controllers')
  .controller('StockAMCModalController', StockAMCModalController);

StockAMCModalController.$inject = [
  'StockService', 'NotifyService', '$uibModalInstance', 'data', 'moment', 'bhConstants',
];

function StockAMCModalController(Stock, Notify, Instance, data, moment, Constants) {
  const vm = this;

  vm.close = () => Instance.dismiss();

  vm.DATE_FORMAT = Constants.dates.format;

  Stock.inventories.loadAMCForInventory(data.inventory_uuid, data.depot_uuid)
    .then(items => {
      vm.data = items;

      vm.settings = vm.data.settings;
      vm.inventory = items.inventory;
      vm.depot = items.depot;

      // FIXME(@jniles) - make this use the quantity from the getCMM() algorithm which
      // is currently returning incorrect data.
      vm.data.quantity_in_stock = data.quantity;

      vm.data.avg_consumption = vm.data[vm.settings.average_consumption_algo];

      // calculate date when the stock will run out at current consumption rate
      const monthsOfStockLeft = vm.data.quantity_in_stock / vm.data.avg_consumption;
      const stockOutDate = moment().add(monthsOfStockLeft, 'months').toDate();

      // provide this information to the view.
      vm.data.stock_out_date = stockOutDate;

      // nicer aliases to use in the HTML
      vm.isAlgo1 = vm.settings.average_consumption_algo === 'algo1';
      vm.isAlgo2 = vm.settings.average_consumption_algo === 'algo2';
      vm.isAlgo3 = vm.settings.average_consumption_algo === 'algo3';
      vm.isAlgo4 = vm.settings.average_consumption_algo === 'algo_msh';
    })
    .catch(Notify.handleError);
}
