
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
      });

      // .state('accounts.create', {
      //   url : '/create',
      //   params : {
      //     parentId : { squash : true, value : null }
      //   },
      //   onEnter :['$uibModal', accountsModal]
      // })
      // .state('accounts.list', {
      //   url : '/:id',
      //   params : {
      //     id : { squash : true, value : null }
      //   }
      // })
      //
      // .state('accounts.edit', {
      //   url : '/:id/edit',
      //   params : {
      //     id : { squash : true, value : null }
      //   },
      //   onEnter :['$uibModal', accountsModal]
      // });
  }]);

// function accountsModal($modal) {
//   var instance = $modal.open({
//     keyboard : false,
//     backdrop : 'static',
//     templateUrl: 'partials/accounts/edit/accounts.edit.modal.html',
//     controller: 'AccountEditController as AccountEditCtrl'
//   });
// }
