angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider
      // Multiple Payroll Registry
      .state('multiple_payroll', {
        url         : '/multiple_payroll',
        controller  : 'MultiplePayrollController as MultiplePayrollCtrl',
        templateUrl : 'modules/multiple_payroll/multiple_payroll.html',
        params : {
          filters : [],
        },
      })

      .state('multiple_payroll.config', {
        url : '/:uuid/config',
        params : {
          config : { value : null },
          filters : [],
        },
        onEnter : ['$uibModal', configurationMultiplePayroll],
        onExit : ['$uibModalStack', closeModal],
      });
  }]);

function configurationMultiplePayroll($modal) {
  $modal.open({
    keyboard : false,
    size : 'lg',
    backdrop : 'static',
    templateUrl : 'modules/multiple_payroll/modals/config.modal.html',
    controller : 'ConfigPaiementModalController as ConfigPaiementModalCtrl',
  });
}


function closeModal(ModalStack) {
  ModalStack.dismissAll();
}
