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
        isCreateState : { value : true },
        parentId : { squash : true, value : null },
      },
      onEnter : ['$uibModal', '$transition$', accountsModal],
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
      onEnter : ['$uibModal', '$transition$', accountsModal],
      onExit : ['$uibModalStack', closeModal],
    })

    .state('accounts.import', {
      url : '/import',
      onEnter : ['$uibModal', importAccountsModal],
      onExit : ['$uibModalStack', closeModal],
    });
}

function accountsModal($modal, $transition) {
  $modal.open({
    templateUrl : 'modules/accounts/edit/accounts.edit.modal.html',
    controller : 'AccountEditController as AccountEditCtrl',
    resolve : { params : () => $transition.params('to') },
  }).result.catch(angular.noop);
}

function importAccountsModal($modal) {
  $modal.open({
    templateUrl : 'modules/accounts/modals/import.html',
    controller : 'ImportAccountsController as ImportAccountsCtrl',
  }).result.catch(angular.noop);
}

function closeModal($uibModalStack) {
  $uibModalStack.dismissAll();
}
