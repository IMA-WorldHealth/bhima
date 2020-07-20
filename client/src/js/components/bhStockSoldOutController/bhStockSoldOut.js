angular.module('bhima.components')
  .component('bhStockSoldOut', {
    templateUrl : 'js/components/bhStockSoldOutController/bhStockSoldOut.html',
    controller  : bhStockSoldOutController,
    transclude  : true,
    bindings    : {
      depotUuid : '<',
      date : '<',
    },
  });

bhStockSoldOutController.$inject = ['StockService', 'moment', 'NotifyService'];

/**
 * service or depot selection component
 */
function bhStockSoldOutController(Stock, moment, Notify) {
  const $ctrl = this;
  $ctrl.loading = false;
  $ctrl.soldOutInventories = [];

  $ctrl.$onInit = () => {
    stockOut();
  };

  $ctrl.$onChanges = () => {
    stockOut();
  };

  /**
   * @function stockOut
   * get stock out inventories for a depot
   */
  function stockOut() {
    const dateTo = $ctrl.date || new Date();
    if (!$ctrl.depotUuid) return;
    $ctrl.loading = true;
    Stock.inventories.read(null, {
      status : 'stock_out',
      depot_uuid : $ctrl.depotUuid,
      dateTo,
    }).then(inventories => {
      inventories.forEach(inventory => {
        inventory.stock_out_date = moment(inventory.stock_out_date).fromNow();
      });
      $ctrl.soldOutInventories = inventories;
    }).catch(Notify.handleError)
      .finally(() => {
        $ctrl.loading = false;
      });
  }

}
