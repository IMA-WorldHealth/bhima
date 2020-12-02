angular.module('bhima.components')
  .component('bhStockExpired', {
    templateUrl : 'js/components/bhStockExpired/bhStockExpired.html',
    controller  : bhStockExpiredController,
    bindings    : {
      depotUuid : '<',
      date : '<?',
    },
  });

bhStockExpiredController.$inject = [
  'StockService', 'moment', 'NotifyService', 'DepotService', '$filter',
];

/**
 * Stock Expired component
 */
function bhStockExpiredController(Stock, moment, Notify, Depot, $filter) {
  const $ctrl = this;

  $ctrl.loading = false;
  $ctrl.expiredInventories = [];

  const $date = $filter('date');

  $ctrl.$onInit = () => {
    fetchExpiredStock();
    getDepot();
  };

  $ctrl.$onChanges = () => {
    fetchExpiredStock();
    getDepot();
  };

  function getDepot() {
    if (!$ctrl.depotUuid) return;
    Depot.read($ctrl.depotUuid)
      .then(depot => {
        $ctrl.depot = depot;
      });
  }

  /**
   * @function fetchExpiredStock()
   *
   * @description
   * Gets expired inventories for a depot
   */
  function fetchExpiredStock() {
    if (!$ctrl.depotUuid) return;
    const dateTo = $ctrl.date || new Date();
    $ctrl.loading = true;

    Stock.inventories.read(null, {
      is_expired : 1,
      depot_uuid : $ctrl.depotUuid,
      includeEmptyLot : 0,
      dateTo,
    })
      .then(inventories => {
        inventories.forEach(inventory => {
          inventory.expiration_date_raw = $date(inventory.expiration_date);
          inventory.expiration_date_parsed = moment(inventory.expiration_date).fromNow();
        });

        $ctrl.expiredInventories = inventories;
      })
      .catch(Notify.handleError)
      .finally(() => {
        $ctrl.loading = false;
      });
  }

}
