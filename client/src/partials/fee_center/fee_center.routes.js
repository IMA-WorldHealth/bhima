
angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider
      .state('feeCenter', {
        abstract : true,
        url : '/fee_center',
        controller : 'feeCenterController as feeCenterCtrl',
        templateUrl : 'partials/fee_center/fee_center.html'
      })
      .state('feeCenter.create', {
        url : '/create',
        params : {
          creating : {value : true}
        },
        onEnter : ['$uibModal', feeCenterModal],
        onExit : ['$uibModalStack', closeModal]
      })
      .state('feeCenter.list', {
        url : '/:id',
        params : {
            id : {squash : true, value : null}
        }
      })
      .state('feeCenter.edit', {
        url : '/:id/edit',
        params : {
          id : null
        },
        onEnter :['$uibModal', feeCenterModal],
        onExit : ['$uibModalStack', closeModal]
      });
    }]);

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}

function feeCenterModal($modal) {
  $modal.open({
    keyboard : false,
    backdrop : 'static',
    templateUrl: 'partials/fee_center/feeCenter.modal.html',
    controller: 'FeeCenterModalController as FeeCenterModalCtrl'
  });
}