angular.module('bhima.routes')
  .config(['$stateProvider', $stateProvider => {
    $stateProvider
      .state('cost_center', {
        url         : '/cost_center',
        controller  : 'CostCenterController as CostCenterCtrl',
        templateUrl : 'modules/cost_center/cost_center.html',
      })
      .state('cost_center.create', {
        url : '/create',
        params : {
          isCreateState : { value : true },
        },
        onEnter : ['$uibModal', '$transition$', costCenterModal],
        onExit : ['$uibModalStack', closeModal],
      })

      .state('cost_center.edit', {
        url : '/:id/edit',
        params : {
          id : { value : null },
        },
        onEnter : ['$uibModal', '$transition$', costCenterModal],
        onExit : ['$uibModalStack', closeModal],
      });
  }]);

function costCenterModal($modal, $transition) {
  $modal.open({
    templateUrl : 'modules/cost_center/modals/cost_center.modal.html',
    controller : 'CostCenterModalController as CostCenterModalCtrl',
    resolve : { params : () => $transition.params('to') },
  }).result.catch(angular.noop);
}

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}
