angular.module('bhima.routes')
  .config(['$stateProvider', $stateProvider => {
    $stateProvider
      .state('fee_center', {
        url         : '/fee_center',
        controller  : 'feeCenterController as FeeCenterCtrl',
        templateUrl : 'modules/fee_center/fee_center.html',
      })
      .state('fee_center.create', {
        url : '/create',
        params : {
          isCreateState : { value : true },
        },
        onEnter : ['$uibModal', '$transition$', feeCenterModal],
        onExit : ['$uibModalStack', closeModal],
      })

      .state('fee_center.edit', {
        url : '/:id/edit',
        params : {
          id : { value : null },
        },
        onEnter : ['$uibModal', '$transition$', feeCenterModal],
        onExit : ['$uibModalStack', closeModal],
      });
  }]);

function feeCenterModal($modal, $transition) {
  $modal.open({
    templateUrl : 'modules/fee_center/modals/fee_center.modal.html',
    controller : 'FeeCenterModalController as FeeCenterModalCtrl',
    resolve : { params : () => $transition.params('to') },
  }).result.catch(angular.noop);
}

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}
