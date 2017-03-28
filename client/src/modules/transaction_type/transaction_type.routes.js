angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider
      .state('transactionType', {
        url         : '/admin/transaction_type',
        controller  : 'TransactionTypeController as TypeCtrl',
        templateUrl : 'modules/transaction_type/transaction_type.html',
      });
  }]);
