angular.module('bhima.components')
  .component('bhStockOut', {
    templateUrl : 'js/components/bhStockOut/bhStockOut.html',
    controller  : bhStockOutController,
    bindings    : {
      depotUuid : '<',
      date : '<?',
    },
  });

bhStockOutController.$inject = ['DepotService', 'moment', 'NotifyService', '$filter', '$q'];

/**
 * @function bhStockOutController
 *
 * @description
 * Displays a list of out of stock items given a depot and date.
 */
function bhStockOutController(Depots, moment, Notify, $filter, $q) {
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

    $q.all([
      Depots.getStockOutsForDate($ctrl.depotUuid, dateTo),
      Depots.read($ctrl.depotUuid),
    ])
      .then(([inventories, depot]) => {

        inventories.forEach(inventory => {
          inventory.stock_out_date_raw = $date(inventory.stock_out_date);
          inventory.stock_out_date_parsed = moment(inventory.stock_out_date).fromNow();
        });

        $ctrl.depot = depot;
        $ctrl.stockOutInventories = inventories;
      })
      .catch(Notify.handleError)
      .finally(() => {
        $ctrl.loading = false;
      });
  }
}
