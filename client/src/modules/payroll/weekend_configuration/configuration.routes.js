angular.module('bhima.routes')
  .config(['$stateProvider', $stateProvider => {
    $stateProvider
      .state('configurationWeekend', {
        url         : '/payroll/weekend_configuration',
        controller  : 'ConfigurationWeekendController as ConfigurationCtrl',
        templateUrl : 'modules/payroll/weekend_configuration/configuration.html',
      })

      .state('configurationWeekend.create', {
        url : '/create',
        params : {
          weekEnd : { value : null },
          creating : { value : true },
        },
        onEnter : ['$uibModal', configurationWeekendModal],
        onExit : ['$uibModalStack', closeModal],
      })

      .state('configurationWeekend.edit', {
        url : '/:id/edit',
        params : {
          weekEnd : { value : null },
          creating : { value : false },
        },
        onEnter : ['$uibModal', configurationWeekendModal],
        onExit : ['$uibModalStack', closeModal],
      });
  }]);

function configurationWeekendModal($modal) {
  $modal.open({
    templateUrl : 'modules/payroll/weekend_configuration/modals/weekEnd.modal.html',
    controller : 'WeekendModalController as WeekendModalCtrl',
  });
}

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}
