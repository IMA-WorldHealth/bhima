angular.module('bhima.routes')
.config(['$stateProvider', function ($stateProvider) {
  $stateProvider
    .state('configurationWeekEnd', {
      url         : '/payroll/weekend_configuration',
      controller  : 'ConfigurationWeekEndController as ConfigurationCtrl',
      templateUrl : 'modules/payroll/weekend_configuration/configuration.html',
    })

    .state('configurationWeekEnd.create', {
      url : '/create',
      params : {
        weekEnd : { value : null },
        creating : { value : true },
      },
      onEnter : ['$uibModal', configurationWeekEndModal],
      onExit : ['$uibModalStack', closeModal],
    })

    .state('configurationWeekEnd.edit', {
      url : '/:id/edit',
      params : {
        weekEnd : { value : null },
        creating : { value : false },
      },
      onEnter : ['$uibModal', configurationWeekEndModal],
      onExit : ['$uibModalStack', closeModal],
    })

    .state('configurationWeekEnd.config', {
      url : '/:id/config',
      params : {
        weekEnd : { value : null },
      },
      onEnter : ['$uibModal', configurationWeekEnd],
      onExit : ['$uibModalStack', closeModal],
    });    
}]);

function configurationWeekEndModal($modal) {
  $modal.open({
    keyboard : false,
    backdrop : 'static',
    templateUrl : 'modules/payroll/weekend_configuration/modals/weekEnd.modal.html',
    controller : 'WeekEndModalController as WeekEndModalCtrl',
  });
}

function configurationWeekEnd($modal) {
  $modal.open({
    keyboard : false,
    backdrop : 'static',
    templateUrl : 'modules/payroll/weekend_configuration/modals/config.modal.html',
    controller : 'WeekEndConfigModalController as WeekEndConfigModalCtrl',
  });
}

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}
