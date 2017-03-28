
angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider
      .state('accounts', {
        abstract : true,
        url : '/accounts',
        controller: 'AccountsController as AccountsCtrl',
        templateUrl: 'modules/accounts/accounts.html'
      })

      .state('accounts.create', {
        url : '/create',
        params : {
          parentId : { squash : true, value : null }
        },
        onEnter :['$uibModal', accountsModal],
        onExit : ['$uibModalStack', closeModal]
      })
      .state('accounts.list', {
        url : '/:id',
        params : {
          id : { squash : true, value : null }
        }
      })

      .state('accounts.edit', {
        url : '/:id/edit',
        params : {
          id : { squash : true, value : null }
        },
        onEnter :['$uibModal', accountsModal],
        onExit : ['$uibModalStack', closeModal]
      });
  }]);

function accountsModal($modal) {
  $modal.open({
    keyboard : false,
    backdrop : 'static',
    templateUrl: 'modules/accounts/edit/accounts.edit.modal.html',
    controller: 'AccountEditController as AccountEditCtrl'
  });
}

function closeModal($uibModalStack) {
  $uibModalStack.dismissAll();
}
