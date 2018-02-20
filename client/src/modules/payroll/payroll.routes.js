angular.module('bhima.routes')
.config(['$stateProvider', function ($stateProvider) {
  $stateProvider
    .state('payroll', {
      url         : '/payroll',
      controller  : 'PayrollConfigurationController as PayrollConfigurationCtrl',
      templateUrl : 'modules/payroll/payroll.html',
    })

    .state('payroll.create', {
      url : '/create',
      params : {
        payroll : { value : null },
        creating : { value : true },
      },
      onEnter : ['$uibModal', payrollModal],
      onExit : ['$uibModalStack', closeModal],
    })

    .state('payroll.edit', {
      url : '/:id/edit',
      params : {
        payroll : { value : null },
        creating : { value : false },
      },
      onEnter : ['$uibModal', payrollModal],
      onExit : ['$uibModalStack', closeModal],
    });
}]);

function payrollModal($modal) {
  $modal.open({
    keyboard : false,
    backdrop : 'static',
    templateUrl : 'modules/payroll/modals/payroll.modal.html',
    controller : 'PayrollConfigModalController as PayrollConfigModalCtrl',
  });
}

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}
