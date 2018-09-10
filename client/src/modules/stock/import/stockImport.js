angular.module('bhima.controllers')
  .controller('StockImportController', StockImportController);

// dependencies injections
StockImportController.$inject = [
  'DepotService', 'InventoryService', 'NotifyService', 'SessionService', 'util',
  'bhConstants', 'ReceiptModal', 'StockFormService', 'StockService',
  'StockModalService', 'uiGridConstants', 'appcache',
];

/**
 * @class StockImportController
 *
 * @description
 * This module helps to import stock from a file
 */
function StockImportController(
  Depots, Inventory, Notify, Session, util, bhConstants, ReceiptModal, StockForm,
  Stock, StockModal, uiGridConstants, AppCache
) {
  const vm = this;

  const cache = new AppCache('StockCache');

  vm.changeDepot = changeDepot;

  function startup() {
    // make sure that the depot is loaded if it doesn't exist at startup.
    if (cache.depotUuid) {
      // load depot from the cached uuid
      loadDepot(cache.depotUuid);
    } else {
      // show the changeDepot modal
      changeDepot();
    }
  }

  function changeDepot() {
    // if requirement is true the modal cannot be canceled
    const requirement = !cache.depotUuid;

    return Depots.openSelectionModal(vm.depot, requirement)
      .then((depot) => {
        vm.depot = depot;
        cache.depotUuid = depot.uuid;
        return depot;
      });
  }

  function loadDepot(uuid) {
    return Depots.read(uuid, { only_user : true })
      .then(depot => {
        vm.depot = depot;
        return depot;
      })
      .catch(Notify.handleError);
  }

  startup();
}
