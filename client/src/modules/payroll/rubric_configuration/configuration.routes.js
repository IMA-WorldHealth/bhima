angular.module('bhima.routes')
.config(['$stateProvider', function ($stateProvider) {
  $stateProvider
    .state('configurationRubric', {
      url         : '/payroll/rubric_configuration',
      controller  : 'ConfigurationController as ConfigurationCtrl',
      templateUrl : 'modules/payroll/rubric_configuration/configuration.html',
    })

    .state('configurationRubric.create', {
      url : '/create',
      params : {
        rubric : { value : null },
        creating : { value : true },
      },
      onEnter : ['$uibModal', configurationModal],
      onExit : ['$uibModalStack', closeModal],
    })

    .state('configurationRubric.edit', {
      url : '/:id/edit',
      params : {
        rubric : { value : null },
        creating : { value : false },
      },
      onEnter : ['$uibModal', configurationModal],
      onExit : ['$uibModalStack', closeModal],
    })

    .state('configurationRubric.config', {
      url : '/:id/config',
      params : {
        rubric : { value : null },
      },
      onEnter : ['$uibModal', configurationRubric],
      onExit : ['$uibModalStack', closeModal],
    });    
}]);

function configurationModal($modal) {
  $modal.open({
    keyboard : false,
    backdrop : 'static',
    templateUrl : 'modules/payroll/rubric_configuration/modals/rubric.modal.html',
    controller : 'ConfigModalController as ConfigModalCtrl',
  });
}

function configurationRubric($modal) {
  $modal.open({
    keyboard : false,
    backdrop : 'static',
    templateUrl : 'modules/payroll/rubric_configuration/modals/config.modal.html',
    controller : 'RubricConfigModalController as RubricConfigModalCtrl',
  });
}

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}