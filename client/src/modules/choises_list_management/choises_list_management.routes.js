angular.module('bhima.routes')
  .config(['$stateProvider', $stateProvider => {
    $stateProvider
      .state('choises_list_management', {
        url         : '/choises_list_management',
        controller  : 'ChoisesListManagementController as ChoisesListManagementCtrl',
        templateUrl : 'modules/choises_list_management/choises_list_management.html',
      })

      .state('choises_list_management.create', {
        url : '/create',
        params : {
          choises_list_management : { value : null },
          creating : { value : true },
          parentId : { value : null },
        },
        onEnter : ['$uibModal', choisesListManagementModal],
        onExit : ['$uibModalStack', closeModal],
      })

      .state('choises_list_management.edit', {
        url : '/:id/edit',
        params : {
          choises_list_management : { value : null },
          creating : { value : false },
        },
        onEnter : ['$uibModal', choisesListManagementModal],
        onExit : ['$uibModalStack', closeModal],
      });
  }]);

function choisesListManagementModal($modal) {
  $modal.open({
    keyboard : false,
    backdrop : 'static',
    templateUrl : 'modules/choises_list_management/modals/choises_list_management.modals.html',
    controller : 'ChoisesListManagementModalController as ChoisesListManagementModalCtrl',
  });
}

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}
