angular.module('bhima.routes')
  .config(['$stateProvider', $stateProvider => {
    $stateProvider
      .state('choices_list_management', {
        url         : '/choices_list_management',
        controller  : 'ChoicesListManagementController as ChoicesListManagementCtrl',
        templateUrl : 'modules/choices_list_management/choices_list_management.html',
      })

      .state('choices_list_management.create', {
        url : '/create',
        params : {
          choices_list_management : { value : null },
          creating : { value : true },
          parentId : { value : null },
        },
        onEnter : ['$uibModal', choicesListManagementModal],
        onExit : ['$uibModalStack', closeModal],
      })

      .state('choices_list_management.edit', {
        url : '/:id/edit',
        params : {
          choices_list_management : { value : null },
          creating : { value : false },
        },
        onEnter : ['$uibModal', choicesListManagementModal],
        onExit : ['$uibModalStack', closeModal],
      });
  }]);

function choicesListManagementModal($modal) {
  $modal.open({
    keyboard : false,
    backdrop : 'static',
    templateUrl : 'modules/choices_list_management/modals/choices_list_management.modals.html',
    controller : 'ChoicesListManagementModalController as ChoicesListManagementModalCtrl',
  });
}

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}
