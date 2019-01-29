angular.module('bhima.routes')
  .config(['$stateProvider', $stateProvider => {
    $stateProvider
      .state('account_reference_type', {
        url         : '/account_reference_type',
        controller  : 'AccountReferenceTypeController as AccountReferenceTypeCtrl',
        templateUrl : 'modules/account_reference_type/account_reference_type.html',
      })

      .state('account_reference_type.create', {
        url : '/create',
        params : {
          account_reference_type : { value : null },
          creating : { value : true },
        },
        onEnter : ['$uibModal', accountReferenceTypeModal],
        onExit : ['$uibModalStack', closeModal],
      })

      .state('account_reference_type.edit', {
        url : '/:id/edit',
        params : {
          account_reference_type : { value : null },
          creating : { value : false },
        },
        onEnter : ['$uibModal', accountReferenceTypeModal],
        onExit : ['$uibModalStack', closeModal],
      });
  }]);

function accountReferenceTypeModal($modal) {
  $modal.open({
    keyboard : false,
    backdrop : 'static',
    templateUrl : 'modules/account_reference_type/modals/account_reference_type.modal.html',
    controller : 'AccountReferenceTypeModalController as AccountReferenceTypeModalCtrl',
  });
}

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}
