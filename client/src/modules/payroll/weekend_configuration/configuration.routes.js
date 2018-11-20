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
      })

      .state('configurationWeekend.config', {
        url : '/:id/config',
        params : {
          weekEnd : { value : null },
        },
        onEnter : ['$uibModal', configurationWeekend],
        onExit : ['$uibModalStack', closeModal],
      });
  }]);

function configurationWeekendModal($modal) {
  $modal.open({
    templateUrl : 'modules/payroll/weekend_configuration/modals/weekEnd.modal.html',
    controller : 'WeekendModalController as WeekendModalCtrl',
  });
}

function configurationWeekend($modal) {
  $modal.open({
    templateUrl : 'modules/payroll/weekend_configuration/modals/config.modal.html',
    controller : 'WeekendConfigModalController as WeekendConfigModalCtrl',
  });
}

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}
