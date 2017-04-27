angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider
      .state('generalLedger', {
        url         : '/general_ledger',
        controller  : 'GeneralLedgerAccountsController as GeneralLedgerAccountsCtrl',
        templateUrl : 'modules/general-ledger/general-ledger-accounts.html',
      });
  }]);
