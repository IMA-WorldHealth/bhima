angular.module('bhima.services')
  .factory('StockDashBoardService', StockDashBoardService);

StockDashBoardService.$inject = ['$http', 'util'];

function StockDashBoardService($http, util) {
  const service = {};
  const baseUrl = '/stock/dashboard';

  service.read = read;

  function read(options) {
    return $http.get(baseUrl, { params : options })
      .then(util.unwrapHttpResponse);
  }

  return service;
}
