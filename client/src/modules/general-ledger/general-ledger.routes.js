angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider
      .state('generalLedger', {
        url         : '/general_ledger',
        controller  : 'GeneralLedgerController as GeneralLedgerCtrl',
        templateUrl : 'modules/general-ledger/general-ledger.html',
      });
  }]);
