angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider
      .state('enterprises', {
        abstract : true,
        url : '/enterprises',
        controller: 'EnterpriseController as EnterpriseCtrl',
        templateUrl: 'partials/enterprises/enterprises.html'
      })
      .state('enterprises.page', {
        url : '',
        views : {
          'exchange@enterprises' : {
            templateUrl : 'partials/enterprises/exchange/exchange.html',
            controller : 'ExchangeController as ExchangeCtrl'
          }
        }
      });
  }]);
