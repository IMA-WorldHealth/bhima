angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider
      .state('agedCreditors', {
        url : '/finance/reports/creditors/aged',
        controller : 'AgedCreditorsController as AgedCreditorsCtrl',
        templateUrl : 'partials/finance/reports/agedCreditors/agedCreditors.html'
      });
  }]);
