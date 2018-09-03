angular.module('bhima.routes')
  .config(['$stateProvider', $stateProvider => {
    $stateProvider
      .state('transactionType', {
        url         : '/transaction_type',
        controller  : 'TransactionTypeController as TypeCtrl',
        templateUrl : 'modules/transaction-type/transaction-type.html',
      });
  }]);
