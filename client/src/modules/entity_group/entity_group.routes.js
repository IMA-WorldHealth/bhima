angular.module('bhima.routes')
  .config(['$stateProvider', $stateProvider => {
    $stateProvider
      .state('entityGroup', {
        url         : '/entity_group',
        controller  : 'EntityGroupController as EntityGroupCtrl',
        templateUrl : 'modules/entity_group/entity_group.html',
      })

      .state('entityGroup.create', {
        url : '/create',
        params : {
          uuid : { value : null },
          creating : { value : true },
        },
        onEnter : ['$uibModal', entityGroupModal],
        onExit : ['$uibModalStack', closeModal],
      })

      .state('entityGroup.edit', {
        url : '/edit',
        params : {
          uuid : { value : null },
          creating : { value : false },
        },
        onEnter : ['$uibModal', entityGroupModal],
        onExit : ['$uibModalStack', closeModal],
      });
  }]);

function entityGroupModal($modal) {
  $modal.open({
    keyboard : false,
    backdrop : 'static',
    templateUrl : 'modules/entity_group/modals/entity_group.modal.html',
    controller : 'EntityGroupModalController as EntityGroupModalCtrl',
  });
}

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}
