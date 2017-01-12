angular.module('bhima.services')
.service('FinancialService', FinancialService);

FinancialService.$inject = [ '$http', 'util' ];

function FinancialService ($http, util) {
  var service = this;

  service.readCostCenter = readCostCenter;
  service.readProfitCenter = readProfitCenter;
  service.getFeeValue = getFeeValue;

  // this will read all cost centers
  function readCostCenter(id, params) {
     var url = '/fee_centers?is_cost=1';
     return $http.get(url, { params : params })
     .then(util.unwrapHttpResponse);
  }

  // this will read all Profit Centers
  function readProfitCenter(id, params) {
     var url = '/fee_centers?is_cost=0';
     return $http.get(url, { params : params })
     .then(util.unwrapHttpResponse);
  }

  //Gives the value of the charges of a cost center
  function getFeeValue(feeId) {
     var url = '/fee_centers/' + feeId + '/value';
     return $http.get(url)
     .then(util.unwrapHttpResponse);
  }

  return service;
}