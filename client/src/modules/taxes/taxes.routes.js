angular.module('bhima.routes')
.config(['$stateProvider', function ($stateProvider) {
  $stateProvider
    .state('taxes', {
      url         : '/taxes',
      controller  : 'TaxManagementController as TaxCtrl',
      templateUrl : 'modules/taxes/taxes.html',
    })

    .state('taxes.create', {
      url : '/create',
      params : {
        tax : { value : null },
        creating : { value : true },
      },
      onEnter : ['$uibModal', taxModal],
      onExit : ['$uibModalStack', closeModal],
    })

    .state('taxes.edit', {
      url : '/:id/edit',
      params : {
        tax : { value : null },
        creating : { value : false },
      },
      onEnter : ['$uibModal', taxModal],
      onExit : ['$uibModalStack', closeModal],
    });
}]);

function taxModal($modal) {
  $modal.open({
    keyboard : false,
    backdrop : 'static',
    templateUrl : 'modules/taxes/modals/tax.modal.html',
    controller : 'TaxModalController as TaxModalCtrl',
  });
}

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}