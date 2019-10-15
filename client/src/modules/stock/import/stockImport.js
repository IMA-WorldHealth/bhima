angular.module('bhima.controllers')
  .controller('StockImportController', StockImportController);

// dependencies injections
StockImportController.$inject = [
  'DepotService', 'NotifyService', 'StockService', 'appcache', 'Upload', '$state',
];

/**
 * @class StockImportController
 *
 * @description
 * This module helps to import stock from a file
 */
function StockImportController(
  Depots, Notify, Stock, AppCache, Upload, $state
) {
  const vm = this;

  const cache = new AppCache('StockCache');

  vm.depot = {};
  vm.downloadTemplate = Stock.downloadTemplate;

  const filters = [
    { key : 'period', value : 'today' },
    { key : 'limit', value : 10000 },
  ];

  vm.onChangeDepot = depot => {
    vm.depot = depot;
  };

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
    const parameters = {
      url : '/stock/import/',
      data : { file, depot_uuid : vm.depot.uuid },
    };

    // upload the file to the server
    return Upload.upload(parameters)
      .then(handleSuccess, handleError);

    // success upload handler
    function handleSuccess() {
      Notify.success('STOCK.IMPORT.UPLOAD_SUCCESS');

      filters.push({ key : 'depot_uuid', value : vm.depot.uuid });
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
    }
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
