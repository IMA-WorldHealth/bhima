angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider
      .state('agedDebtors', {
        url : '/finance/reports/debtors/aged',
        controller : 'AgedDebtorsController as AgedDebtorsCtrl',
        templateUrl : 'modules/finance/reports/agedDebtors/agedDebtors.html'
      });
  }]);
