angular.module('bhima.routes')
  .config(['$stateProvider', $stateProvider => {
    $stateProvider
      .state('subsidies', {
        url         : '/subsidies',
        controller  : 'SubsidyController as SubsidyCtrl',
        templateUrl : 'modules/subsidies/subsidies.html',
      })

      .state('subsidies.create', {
        url : '/create',
        params : {
          creating : { value : true },
        },
        onEnter : ['$uibModal', subsidyModal],
        onExit : ['$uibModalStack', closeModal],
      })

      .state('subsidies.edit', {
        url : '/:id/edit',
        params : {
          id : { value : null },
          creating : { value : false },
        },
        onEnter : ['$uibModal', subsidyModal],
        onExit : ['$uibModalStack', closeModal],
      });
  }]);

function subsidyModal($modal) {
  $modal.open({
    keyboard : false,
    backdrop : 'static',
    templateUrl : 'modules/subsidies/modals/subsidies.modal.html',
    controller : 'SubsidyModalController as SubsidyModalCtrl',
  });
}

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}
