angular.module('bhima.controllers')
  .controller('StockImportController', StockImportController);

// dependencies injections
StockImportController.$inject = [
  'DepotService', 'InventoryService', 'NotifyService', 'SessionService', 'util',
  'bhConstants', 'ReceiptModal', 'StockFormService', 'StockService',
  'StockModalService', 'uiGridConstants', 'appcache', 'Upload', '$state',
];

/**
 * @class StockImportController
 *
 * @description
 * This module helps to import stock from a file
 */
function StockImportController(
  Depots, Inventory, Notify, Session, util, bhConstants, ReceiptModal, StockForm,
  Stock, StockModal, uiGridConstants, AppCache, Upload, $state
) {
  const vm = this;

  const cache = new AppCache('StockCache');

  vm.depot = {};
  vm.changeDepot = changeDepot;
  vm.downloadTemplate = Stock.downloadTemplate;

  const filters = [
    { key : 'period', value : 'today' },
    { key : 'limit', value : 10000 },
    { key : 'depot_uuid', value : vm.depot.uuid },
  ];

  vm.submit = () => {
    // send data only when a file is selected
    if (!vm.depot.uuid || !vm.file) {
      vm.noSelectedFile = true;
      return null;
    }

    return uploadFile(vm.file);
  };

  /** upload the file to server */
  function uploadFile(file) {
    vm.uploadState = 'uploading';

    const parameters = {
      url : '/stock/import/',
      data : { file, depot_uuid : vm.depot.uuid },
    };

    // upload the file to the server
    return Upload.upload(parameters)
      .then(handleSuccess, handleError);

    // success upload handler
    function handleSuccess() {
      vm.uploadState = 'uploaded';
      Notify.success('STOCK.IMPORT.UPLOAD_SUCCESS');
      $state.go('stockLots', { filters });
    }

    function handleError(err) {
      Notify.handleError(err);
    }
  }

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
      .then(depot => {
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
