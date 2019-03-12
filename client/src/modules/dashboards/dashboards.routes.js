angular.module('bhima.routes')
  .config(['$stateProvider', ($stateProvider) => {
    $stateProvider
      .state('indicatorsFilesRegistry', {
        url         : '/dashboards/indicators_files_registry',
        controller  : 'IndicatorsFilesRegistryController as $ctrl',
        templateUrl : 'modules/dashboards/indicators_files_registry/indicators_files_registry.html',
      })

      .state('indicatorsFilesRegistry.addHospitalizationFile', {
        url : '/addHospitalizationFile',
        params : {
          creating : { value : true },
        },
        onEnter : ['$uibModal', hospitalizationModal],
        onExit : ['$uibModalStack', closeModal],
      })

      .state('indicatorsFilesRegistry.editHospitalizationFile', {
        url : '/editHospitalizationFile',
        params : {
          creating : { value : false },
        },
        onEnter : ['$uibModal', hospitalizationModal],
        onExit : ['$uibModalStack', closeModal],
      });
  }]);

function hospitalizationModal($modal) {
  $modal.open({
    keyboard : false,
    backdrop : 'static',
    size : 'lg',
    templateUrl : 'modules/dashboards/indicators_files_registry/modals/hospitalization.modal.html',
    controller : 'HospitalizationModalController as $ctrl',
  });
}

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}
