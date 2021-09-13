angular.module('bhima.routes')
  .config(['$stateProvider', $stateProvider => {
    $stateProvider
      .state('fee_center_allocation', {
        url         : '/fee_center_allocation',
        controller  : 'feeCenterController as FeeCenterAllocationCtrl',
        templateUrl : 'modules/fee_center_allocation/fee_center_allocation.html',
      })
      .state('fee_center_allocation.create', {
        url : '/create',
        params : {
          isCreateState : { value : true },
        },
        onEnter : ['$uibModal', '$transition$', feeCenterModal],
        onExit : ['$uibModalStack', closeModal],
      })

      .state('fee_center_allocation.edit', {
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
    templateUrl : 'modules/fee_center_allocation/modals/fee_center_allocation.modal.html',
    controller : 'FeeCenterAllocationModalController as FeeCenterAllocationModalCtrl',
    resolve : { params : () => $transition.params('to') },
  }).result.catch(angular.noop);
}

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}
