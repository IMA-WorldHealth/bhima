angular.module('bhima.routes')
  .config(['$stateProvider', $stateProvider => {
    $stateProvider
      .state('entities', {
        url         : '/entities',
        controller  : 'EntityController as EntityCtrl',
        templateUrl : 'modules/entities/entities.html',
      })

      .state('entities.create', {
        url : '/create',
        params : {
          entity : { value : {} },
          creating : { value : true },
        },
        onEnter : ['$uibModal', entityModal],
        onExit : ['$uibModalStack', closeModal],
      })

      .state('entities.edit', {
        url : '/:uuid/edit',
        params : {
          uuid : { value : null },
          creating : { value : false },
        },
        onEnter : ['$uibModal', entityModal],
        onExit : ['$uibModalStack', closeModal],
      })

      .state('entities_type', {
        url         : '/entities_type',
        controller  : 'EntityTypeController as EntityTypeCtrl',
        templateUrl : 'modules/entities/types/types.html',
      });
  }]);

function entityModal($modal) {
  $modal.open({
    keyboard : false,
    backdrop : 'static',
    templateUrl : 'modules/entities/modals/entity.modal.html',
    controller : 'EntityModalController as EntityModalCtrl',
  });
}

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}
