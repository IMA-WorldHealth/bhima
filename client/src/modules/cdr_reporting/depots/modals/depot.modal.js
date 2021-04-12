angular.module('bhima.controllers')
  .controller('CdrDepotModalController', CdrDepotModalController);

CdrDepotModalController.$inject = [
  '$state', 'CdrDepotService', 'Upload', 'NotifyService', 'SessionService', 'params',
];

function CdrDepotModalController($state, Depots, Upload, Notify, Session, params) {
  const vm = this;

  vm.depot = {};
  vm.identifier = params.uuid;
  vm.isCreateState = params.isCreateState;
  vm.clear = clear;
  vm.submit = submit;

  if (!vm.isCreateState) {
    if (!vm.identifier) { return; }
    Depots.read(vm.identifier)
      .then(depot => {
        depot.version = new Date(depot.last_movement_date);
        vm.depot = depot;
      })
      .catch(Notify.handleError);
  }

  function clear(item) {
    delete vm.depot[item];
  }

  /**
   * @method submit
   * @description submit the data to the server from all two forms (update, create)
   * @todo check depotForm.$pristine state also for changes in components
   */
  function submit() {

    // send data only when files are selected
    if (!vm.movementFile || !vm.articleFile || !vm.lotFile || !vm.lotDocFile) {
      vm.noSelectedMovementFile = !vm.movementFile;
      vm.noSelectedArticleFile = !vm.articleFile;
      vm.noSelectedLotFile = !vm.lotFile;
      vm.noSelectedLotDocFile = !vm.lotDocFile;
      return null;
    }

    const files = [
      vm.movementFile,
      vm.articleFile,
      vm.lotFile,
      vm.lotDocFile,
    ];

    return uploadFile(...files);
  }

  function uploadFile(movements, articles, lots, lotsDoc) {
    const data = {
      movements,
      articles,
      lots,
      lotsDoc,
      depot : vm.depot,
    };

    const parameters = {
      method : !vm.isCreateState ? 'PUT' : 'POST',
      url : !vm.isCreateState ? `/cdr_reporting/depots/${vm.identifier}` : '/cdr_reporting/depots/',
      data,
    };

    // upload the file to the server
    return Upload.upload(parameters)
      .then(handleSuccess, handleError);

    // success upload handler
    function handleSuccess() {
      Notify.success('STOCK.IMPORT.UPLOAD_SUCCESS');

      $state.go('cdrReportingDepots', null, { reload : true });
    }

    function handleError(err) {
      Notify.handleError(err);
    }
  }
}
