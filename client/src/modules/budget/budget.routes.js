angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider
      .state('budget', {
        url         : '/budget',
        controller  : 'BudgetController as BudgetCtrl',
        templateUrl : 'modules/budget/budget.html',
      });
  }]);
