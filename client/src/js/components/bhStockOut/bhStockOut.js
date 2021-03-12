angular.module('bhima.components')
  .component('bhStockOut', {
    templateUrl : 'js/components/bhStockOut/bhStockOut.html',
    controller  : bhStockOutController,
    bindings    : {
      depotUuid : '<',
      date : '<',
    },
  });

bhStockOutController.$inject = ['StockService', 'moment', 'NotifyService', '$filter'];

/**
 * @function bhStockOutController
 */
function bhStockOutController(Stock, moment, Notify, $filter) {
  const $ctrl = this;
  $ctrl.loading = false;
  $ctrl.stockOutInventories = [];

  const $date = $filter('date');

  $ctrl.$onInit = () => {
    fetchStockOuts();
  };

  $ctrl.$onChanges = () => {
    fetchStockOuts();
  };

  /**
   * @function fetchStockOuts
   * Get stock out inventories for a depot on a particular date.
   */
  function fetchStockOuts() {
    if (!$ctrl.depotUuid) return;

    const dateTo = $ctrl.date || new Date();
    $ctrl.loading = true;

    Stock.inventories.read(null, {
      status : 'stock_out',
      depot_uuid : $ctrl.depotUuid,
      dateTo,
    })
      .then(inventories => {
        inventories.forEach(inventory => {
          inventory.stock_out_date_raw = $date(inventory.stock_out_date);
          inventory.stock_out_date_parsed = moment(inventory.stock_out_date).fromNow();
        });

        $ctrl.stockOutInventories = inventories;
      })
      .catch(Notify.handleError)
      .finally(() => {
        $ctrl.loading = false;
      });
  }

}
