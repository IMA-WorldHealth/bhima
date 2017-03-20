angular.module('bhima.services')
.service('StockService', StockService);

StockService.$inject = [ 'PrototypeApiService' ];

function StockService(Api) {

  // API for stock lots
  var stocks = new Api('/stock/lots');

  // API for stock lots in depots
  var lots = new Api('/stock/lots/depots');

  // API for stock lots movements
  var movements = new Api('/stock/lots/movements');

  // API for stock inventory in depots
  var inventories = new Api('/stock/inventories/depots');

  // API for stock integration
  var integration = new Api('/stock/integration');

  var service = {
    stocks      : stocks,
    lots        : lots,
    movements   : movements,
    inventories : inventories,
    integration : integration,
  };

  return service;
}
