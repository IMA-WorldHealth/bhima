angular.module('bhima.routes')
  .config(['$stateProvider', function multiplePayrollRoutes($stateProvider) {
    $stateProvider
      // Multiple Payroll Registry
      .state('multiple_payroll_indice', {
        url         : '/multiple_payroll_indice',
        controller  : 'MultiplePayrollIndiceController as MultiplePayrollCtrl',
        templateUrl : 'modules/multiple_payroll_indice/multiple_payroll_indice.html',
        params : {
          filters : [],
        },
      })

      .state('multiple_payroll_indice.config', {
        url : '/:uuid/config',
        params : {
          config : { value : null },
          filters : [],
        },
        onEnter : ['$uibModal', configurationMultipleIndicePayroll],
        onExit : ['$uibModalStack', closeModal],
      });
  }]);

function configurationMultipleIndicePayroll($modal) {
  $modal.open({
    keyboard : false,
    size : 'lg',
    backdrop : 'static',
    templateUrl : 'modules/multiple_payroll_indice/modals/config.modal.html',
    controller : 'ConfigIndicePaiementModalController as ConfigPaiementModalCtrl',
  });
}


function closeModal(ModalStack) {
  ModalStack.dismissAll();
}
