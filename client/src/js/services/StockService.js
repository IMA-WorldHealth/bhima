angular.module('bhima.services')
.service('StockService', StockService);

StockService.$inject = [ 'PrototypeApiService' ];

function StockService(Api) {

    // API for stock lots 
  var lots = new Api('/stock/lots/depots');

    // API for stock lots movements 
  var movements = new Api('/stock/lots/movements');

    // API for stock inventory in depots 
  var inventories = new Api('/stock/inventories/depots');

  var service = {
    lots        : lots,
    movements   : movements,
    inventories : inventories,
  };

  return service;
}
