angular.module('bhima.services')
.service('FinancialService', FinancialService);

FinancialService.$inject = [ '$http', 'util' ];

function FinancialService ($http, util) {
  var service = this;
  var baseUrl = '/fee_centers/';

  service.readFeeCenter = readFeeCenter;
  service.readCostCenter = readCostCenter;
  service.readProfitCenter = readProfitCenter;
  service.getFeeValue = getFeeValue;

  function readFeeCenter(id, params) {
    var url = baseUrl.concat(id || '');
    return $http.get(baseUrl, { params : params })
      .then(util.unwrapHttpResponse);
  }

  // this will read all cost centers
  function readCostCenter(id, params) {
    var costParameters = angular.extend(params, { is_cost : 1 });
    return readFeeCenter(id, costParameters);
  }

  // this will read all Profit Centers
  function readProfitCenter(id, params) {
    var profitParameters = angular.extend(params, { is_cost : 0 });
    return readFeeCenter(id, profitParameters);
  }

  //Gives the value of the charges of a cost center
  function getFeeValue(feeId) {
     var url = baseUrl + feeId + '/value';
     return $http.get(url)
     .then(util.unwrapHttpResponse);
  }

  return service;
}