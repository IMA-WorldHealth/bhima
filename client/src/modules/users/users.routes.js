angular.module('bhima.routes')
  .config(['$stateProvider', ($stateProvider) => {

    $stateProvider
      .state('users', {
        abstract : true,
        url : '/users',
        controller : 'UsersController as UsersCtrl',
        templateUrl : 'modules/users/users.html',
      })

      .state('users.create', {
        url : '/create',
        params : {
          isCreateState : { value : true },
        },
        onEnter : ['$uibModal', '$transition$', usersModal],
        onExit : ['$uibModalStack', closeModal],
      })
      .state('users.list', {
        url : '/:id',
        params : {
          id : { squash : true, value : null },
          filters : { value : [] },
        },
      })
      .state('users.edit', {
        url : '/:id/edit',
        params : {
          id : null,
        },
        onEnter : ['$uibModal', '$transition$', usersModal],
        onExit : ['$uibModalStack', closeModal],
      })
      .state('users.depotManagement', {
        url : '/:id/depotManagement',
        params : {
          id : null,
        },
        onEnter : ['$uibModal', '$transition$', depotManagementModal],
        onExit : ['$uibModalStack', closeModal],
      })
      .state('users.cashBoxManagement', {
        url : '/:id/cashboxes',
        params : {
          id : null,
        },
        onEnter : ['$uibModal', '$transition$', cashBoxManagementModal],
        onExit : ['$uibModalStack', closeModal],
      })
      .state('users.editPassword', {
        url : '/:id/edit/password',
        params : {
          id : null,
        },
        onEnter : ['$uibModal', '$transition$', userPasswordModal],
        onExit : ['$uibModalStack', closeModal],
      });
  }]);

function usersModal($modal, $transition) {
  $modal.open({
    templateUrl : 'modules/users/user.modal.html',
    controller : 'UserModalController as UserModalCtrl',
    resolve : { params : () => $transition.params('to') },
  }).result.catch(angular.noop);
}

function userPasswordModal($modal, $transition) {
  $modal.open({
    size : 'md',
    templateUrl : 'modules/users/UserEditPasswordModal.html',
    controller :  'UsersPasswordModalController as UsersPasswordModalCtrl',
    resolve : { params : () => $transition.params('to') },
  }).result.catch(angular.noop);
}

function depotManagementModal($modal, $transition) {
  $modal.open({
    size : 'md',
    templateUrl : 'modules/users/UserDepotManagementModal.html',
    controller :  'UsersDepotManagementController as UsersDepotModalCtrl',
    resolve : { params : () => $transition.params('to') },
  }).result.catch(angular.noop);
}

function cashBoxManagementModal($modal, $transition) {
  $modal.open({
    size : 'md',
    templateUrl : 'modules/users/UserCashBoxManagementModal.html',
    controller :  'UsersCashBoxManagementController as UsersCashBoxModalCtrl',
    resolve : { params : () => $transition.params('to') },
  }).result.catch(angular.noop);
}

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}
