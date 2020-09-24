angular.module('bhima.components')
  .component('bhStockSoldOut', {
    templateUrl : 'js/components/bhStockSoldOut/bhStockSoldOut.html',
    controller  : bhStockSoldOutController,
    bindings    : {
      depotUuid : '<',
      date : '<',
    },
  });

bhStockSoldOutController.$inject = ['StockService', 'moment', 'NotifyService', '$filter'];

/**
 * @function bhStockSoldOutController
 */
function bhStockSoldOutController(Stock, moment, Notify, $filter) {
  const $ctrl = this;
  $ctrl.loading = false;
  $ctrl.soldOutInventories = [];

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
          inventory.stock_out_date = moment(inventory.stock_out_date).fromNow();
        });

        $ctrl.soldOutInventories = inventories;
      })
      .catch(Notify.handleError)
      .finally(() => {
        $ctrl.loading = false;
      });
  }

}
