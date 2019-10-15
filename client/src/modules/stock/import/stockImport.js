angular.module('bhima.controllers')
  .controller('StockImportController', StockImportController);

// dependencies injections
StockImportController.$inject = [
  'NotifyService', 'StockService', 'Upload', '$state',
];

/**
 * @class StockImportController
 *
 * @description
 * This module helps to import stock from a file
 */
function StockImportController(
  Notify, Stock, Upload, $state
) {
  const vm = this;

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
}
