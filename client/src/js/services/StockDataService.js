angular.module('bhima.services')
.service('StockDataService', StockDataService);

StockDataService.$inject = ['$http'];

function StockDataService($http) {
  var service = this;

  service.getDepots             = getDepots;
  service.getConsumption        = getConsumption;
  service.getAverageConsumption = getAverageConsumption;
  service.getDonations          = getDonations;
  service.getStockStatus        = getStockStatus;
  service.getStockExpirations   = getStockExpirations;

  /* ------------------------------------------------------------------------ */

  // GET depots for current enterprise
  function getDepots(id) {
    return (id === undefined) ?
      $http.get('/depots') :
      $http.get('/depots/' + id);
  }

  function getConsumption() {
    return $http.get('/inventory/consumption?detailed=1');
  }

  function getAverageConsumption() {
    return $http.get('/inventory/consumption?detailed=1&average=1');
  }

  function getStockStatus() {
    return $http.get('/inventory/status');
  }

  function getLeadTimes() {
    return $http.get('/inventory/leadtimes');
  }

  function getStockExpirations(start, end) {
    var url = '/inventory/expirations?' +
      'start=' + start +
      '&end=' + end;

    return $http.get(url);
  }

  // TODO -- implement limit functionality
  function getDonations(limit) {
    return $http.get('/inventory/donations?limit=' + limit);
  }
}
