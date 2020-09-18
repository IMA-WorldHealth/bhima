angular.module('bhima.routes')
  .config(['$stateProvider', $stateProvider => {
    $stateProvider
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
          uuid : { value : null },
          filters : [],
        },
        onEnter : ['$uibModal', '$transition$', configurationMultiplePayroll],
        onExit : ['$uibModalStack', closeModal],
      });
  }]);

function configurationMultiplePayroll($modal, $transition) {
  $modal.open({
    size : 'lg',
    templateUrl : 'modules/multiple_payroll/modals/config.modal.html',
    controller : 'ConfigPaiementModalController as ConfigPaiementModalCtrl',
    resolve : { params : () => $transition.params('to') },
  }).result.catch(angular.noop);
}

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}
