angular.module('bhima.routes')
  .config(['$stateProvider', $stateProvider => {
    $stateProvider
      .state('fee_center', {
        url         : '/fee_center',
        controller  : 'FeeCenterController as FeeCenterCtrl',
        templateUrl : 'modules/fee_center/fee_center.html',
      })
      .state('fee_center.create', {
        url : '/create',
        params : {
          fee_center : { value : null },
          creating : { value : true },
        },
        onEnter : ['$uibModal', feeCenterModal],
        onExit : ['$uibModalStack', closeModal],
      })

      .state('fee_center.edit', {
        url : '/:id/edit',
        params : {
          fee_center : { value : null },
          creating : { value : false },
        },
        onEnter : ['$uibModal', feeCenterModal],
        onExit : ['$uibModalStack', closeModal],
      });
  }]);

function feeCenterModal($modal) {
  $modal.open({
    keyboard : false,
    backdrop : 'static',
    templateUrl : 'modules/fee_center/modals/fee_center.modal.html',
    controller : 'FeeCenterModalController as FeeCenterModalCtrl',
  });
}

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}
