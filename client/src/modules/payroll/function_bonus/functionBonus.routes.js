angular.module('bhima.routes')
  .config(['$stateProvider', function Provider($stateProvider) {

    $stateProvider.state('function_bonus', {
      url : '/function_bonus',
      templateUrl : 'modules/payroll/function_bonus/functionBonus.html',
      controller : 'FunctionBonusController as functionBonusCtrl',
    });
  }]);
