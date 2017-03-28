
angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider
      .state('users', {
        abstract : true,
        url : '/users',
        controller: 'UsersController as UsersCtrl',
        templateUrl: 'modules/users/users.html'
      })

      .state('users.create', {
        url : '/create',
        params : {
          creating : { value : true }
        },
        onEnter :['$uibModal', usersModal],
        onExit : ['$uibModalStack', closeModal]
      })
      .state('users.list', {
        url : '/:id',
        params : {
          id : { squash : true, value : null }
        }
      })
      .state('users.edit', {
        url : '/:id/edit',
        params : {
          id : null
        },
        onEnter :['$uibModal', usersModal],
        onExit : ['$uibModalStack', closeModal]
      })
      .state('users.editPermission', {
        url : '/:id/editPermission',
        params : {
          id : null
        },
        onEnter :['$uibModal', userPermissionModal],
        onExit : ['$uibModalStack', closeModal]
      })
      .state('users.editPassword', {
        url : '/:id/edit/password',
        params : {
          id : null
        },
        onEnter :['$uibModal', userPasswordModal],
        onExit : ['$uibModalStack', closeModal]
      })
      ;
  }]);

function usersModal($modal) {
  $modal.open({
    keyboard : false,
    backdrop : 'static',
    templateUrl: 'modules/users/user.modal.html',
    controller: 'UserModalController as UserModalCtrl'
  });
}

function userPermissionModal($modal) {
  $modal.open({
    keyboard : false,
    size : 'lg',
    backdrop : 'static',
    templateUrl: 'modules/users/userPermission.modal.html',
    controller: 'UserPermissionModalController as UserPermissionModalCtrl'
  });
}

function userPasswordModal($modal) {
  $modal.open({
    keyboard : false,
    size : 'md',
    backdrop : 'static',
    templateUrl: 'modules/users/UserEditPasswordModal.html',
    controller:  'UsersPasswordModalController as UsersPasswordModalCtrl'
  });
}

function closeModal(ModalStack) {
  ModalStack.dismissAll();
}