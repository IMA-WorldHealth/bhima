
angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider
      .state('users', {
        abstract : true,
        url : '/users',
        controller: 'UsersController as UsersCtrl',
        templateUrl: 'partials/users/users.html'
      })
      .state('users.list', {
        url : '/:id',
        params : {
          id : { squash : true, value : null }
        }
      })
      .state('users.create', {
        url : '/create',
        params : {
          creating : null
        },
        onEnter :['$uibModal', usersModal]
      })
      .state('users.edit', {
        url : '/:id/edit',
        params : {
          id : null
        },
        onEnter :['$uibModal', usersModal]
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
