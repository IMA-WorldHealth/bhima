
angular.module('bhima.routes')
  .config(['$stateProvider', accountStateProvider]);

function accountStateProvider($stateProvider) {
  $stateProvider
    .state('accounts', {
      abstract : true,
      url : '/accounts',
      controller : 'AccountsController as AccountsCtrl',
      templateUrl : 'modules/accounts/accounts.html',
    })

    .state('accounts.create', {
      url : '/create',
      params : {
        parentId : { squash : true, value : null },
      },
      onEnter : ['$uibModal', accountsModal],
      onExit : ['$uibModalStack', closeModal],
    })

    .state('accounts.list', {
      url : '/:id',
      params : {
        id : { squash : true, value : null },
      },
    })

    .state('accounts.edit', {
      url : '/:id/edit',
      params : {
        id : { squash : true, value : null },
      },
      onEnter : ['$uibModal', accountsModal],
      onExit : ['$uibModalStack', closeModal],
    })

    .state('accounts.import', {
      url : '/import',
      onEnter : ['$uibModal', importAccountsModal],
      onExit : ['$uibModalStack', closeModal],
    });
}

function accountsModal($modal) {
  $modal.open({
    templateUrl : 'modules/accounts/edit/accounts.edit.modal.html',
    controller : 'AccountEditController as AccountEditCtrl',
  });
}

function importAccountsModal($modal) {
  $modal.open({
    templateUrl : 'modules/accounts/modals/import.html',
    controller : 'ImportAccountsController as ImportAccountsCtrl',
  });
}

function closeModal($uibModalStack) {
  $uibModalStack.dismissAll();
}
