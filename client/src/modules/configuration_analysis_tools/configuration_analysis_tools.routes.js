angular.module('bhima.routes')
  .config(['$stateProvider', $stateProvider => {
    $stateProvider
      .state('configuration_analysis_tools', {
        url         : '/configuration_analysis_tools',
        controller  : 'ConfigurationAnalysisToolsController as ConfigurationAnalysisToolsCtrl',
        templateUrl : 'modules/configuration_analysis_tools/configuration_analysis_tools.html',
      })

      .state('configuration_analysis_tools.create', {
        url : '/create',
        params : {
          configuration_analysis_tools : { value : null },
          creating : { value : true },
        },
        onEnter : ['$uibModal', configurationAnalysisToolsModal],
        onExit : ['$uibModalStack', closeModal],
      })

      .state('configuration_analysis_tools.edit', {
        url : '/:id/edit',
        params : {
          configuration_analysis_tools : { value : null },
          creating : { value : false },
        },
        onEnter : ['$uibModal', configurationAnalysisToolsModal],
        onExit : ['$uibModalStack', closeModal],
      });
  }]);

function configurationAnalysisToolsModal($modal) {
  $modal.open({
    keyboard : false,
    backdrop : 'static',
    templateUrl : 'modules/configuration_analysis_tools/modals/configuration_analysis_tools.modal.html',
    controller : 'ConfigurationAnalysisToolsModalController as ConfigurationAnalysisToolsModalCtrl',
  });
}

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}
