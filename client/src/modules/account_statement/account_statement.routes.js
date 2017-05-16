angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider
      .state('accountStatement', {
        url         : '/account_statement',
        controller  : 'AccountStatementController as AccountStateCtrl',
        templateUrl : 'modules/account_statement/account_statement.html',
      });
  }]);
