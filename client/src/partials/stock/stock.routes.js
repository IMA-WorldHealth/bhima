angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider
      .state('stockLots', {
        url : '/stock/lots',
        controller: 'StockLotsController as StockLotsCtrl',
        templateUrl: 'partials/stock/lots/registry.html'
      })

      .state('stockMovements', {
        url : '/stock/movements',
        controller: 'StockLotsController as StockLotsCtrl',
        templateUrl: 'partials/stock/lots/registry.html'
      })

      .state('stockInventories', {
        url : '/stock/inventories',
        controller: 'StockLotsController as StockLotsCtrl',
        templateUrl: 'partials/stock/lots/registry.html'
      })
      ;

  }]);