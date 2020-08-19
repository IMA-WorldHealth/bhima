angular.module('bhima.components')
  .component('bhStockExpired', {
    templateUrl : 'js/components/bhStockExpired/bhStockExpired.html',
    controller  : bhStockExpiredController,
    transclude  : true,
    bindings    : {
      depotUuid : '<',
      date : '<?',
    },
  });

bhStockExpiredController.$inject = [
  'StockService', 'moment', 'NotifyService', 'DepotService',
];

/**
 * Stock Expired component
 */
function bhStockExpiredController(Stock, moment, Notify, Depot) {
  const $ctrl = this;
  $ctrl.loading = false;
  $ctrl.expiredInventories = [];

  $ctrl.$onInit = () => {
    expired();
    getDepot();
  };

  $ctrl.$onChanges = () => {
    expired();
    getDepot();
  };

  function getDepot() {
    if (!$ctrl.depotUuid) return;
    Depot.read($ctrl.depotUuid).then(depot => {
      $ctrl.depot = depot;
    });
  }

  /**
   * @function expred
   * get expired inventories for a depot
   */
  function expired() {
    const dateTo = $ctrl.date || new Date();
    if (!$ctrl.depotUuid) return;
    $ctrl.loading = true;
    Stock.inventories.read(null, {
      is_expired : 1,
      depot_uuid : $ctrl.depotUuid,
      includeEmptyLot : 0,
      dateTo,
    }).then(inventories => {
      inventories.forEach(inventory => {
        inventory.expiration_date = moment(inventory.expiration_date).fromNow();
      });
      $ctrl.expiredInventories = inventories;
    }).catch(Notify.handleError)
      .finally(() => {
        $ctrl.loading = false;
      });
  }

}
