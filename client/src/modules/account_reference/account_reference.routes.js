angular.module('bhima.routes')
  .config(['$stateProvider', $stateProvider => {

    $stateProvider
      .state('account_reference', {
        abstract : true,
        url : '/account_reference',
        controller : 'AccountReferenceController as AccountReferenceCtrl',
        templateUrl : 'modules/account_reference/account_reference.html',
      })

      .state('account_reference.create', {
        url : '/create',
        params : {
          creating : { value : true },
        },
        onEnter : ['$uibModal', accountReferenceModal],
        onExit : ['$uibModalStack', closeModal],
      })
      .state('account_reference.list', {
        url : '/:id',
        params : {
          id : { squash : true, value : null },
        },
      })
      .state('account_reference.edit', {
        url : '/:id/edit',
        params : {
          id : null,
        },
        onEnter : ['$uibModal', accountReferenceModal],
        onExit : ['$uibModalStack', closeModal],
      });
  }]);

function accountReferenceModal($modal) {
  $modal.open({
    keyboard : false,
    backdrop : 'static',
    templateUrl : 'modules/account_reference/account_reference.modal.html',
    controller : 'AccountReferenceModalController as AccountReferenceModalCtrl',
  });
}

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}
