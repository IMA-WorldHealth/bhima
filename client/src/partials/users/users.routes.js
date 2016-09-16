
angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider
      .state('users', {
        abstract : true,
        url : '/users',
        controller: 'UsersController as UsersCtrl',
        templateUrl: 'partials/users/users.html'
      })

      .state('users.create', {
        url : '/create',
        params : {
          creating : { value : true }
        },
        onEnter :['$uibModal', usersModal]
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
        onEnter :['$uibModal', usersModal]
      })
      .state('users.editPermission', {
        url : '/:id/editPermission',
        params : {
          id : null
        },
        onEnter :['$uibModal', userPermissionModal]
      });
  }]);

function usersModal($modal) {
  $modal.open({
    keyboard : false,
    backdrop : 'static',
    templateUrl: 'partials/users/user.modal.html',
    controller: 'UserModalController as UserModalCtrl'
  });
}

function userPermissionModal($modal) {
  $modal.open({
    keyboard : false,
    size : 'lg',
    backdrop : 'static',
    templateUrl: 'partials/users/userPermission.modal.html',
    controller: 'UserPermissionModalController as UserPermissionModalCtrl'
  });
}
