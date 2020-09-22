angular.module('bhima.routes')
  .config(['$stateProvider', $stateProvider => {
    $stateProvider
      .state('configurationRubric', {
        url         : '/payroll/rubric_configuration',
        controller  : 'ConfigurationController as ConfigurationCtrl',
        templateUrl : 'modules/payroll/rubric_configuration/configuration.html',
      })

      .state('configurationRubric.create', {
        url : '/create',
        params : {
          isCreateState : { value : true },
        },
        onEnter : ['$uibModal', '$transition$', configurationRubricModal],
        onExit : ['$uibModalStack', closeModal],
      })

      .state('configurationRubric.edit', {
        url : '/:id/edit',
        params : {
          id : { value : null },
        },
        onEnter : ['$uibModal', '$transition$', configurationRubricModal],
        onExit : ['$uibModalStack', closeModal],
      })

      .state('configurationRubric.config', {
        url : '/:id/config',
        params : {
          id : { value : null },
        },
        onEnter : ['$uibModal', '$transition$', configurationRubric],
        onExit : ['$uibModalStack', closeModal],
      });
  }]);

function configurationRubricModal($modal, $transition) {
  $modal.open({
    templateUrl : 'modules/payroll/rubric_configuration/modals/rubric.modal.html',
    controller : 'ConfigModalController as ConfigModalCtrl',
    resolve : { params : () => $transition.params('to') },
  }).result.catch(angular.noop);
}

function configurationRubric($modal, $transition) {
  $modal.open({
    templateUrl : 'modules/payroll/rubric_configuration/modals/config.modal.html',
    controller : 'RubricConfigModalController as RubricConfigModalCtrl',
    resolve : { params : () => $transition.params('to') },
  }).result.catch(angular.noop);
}

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}
