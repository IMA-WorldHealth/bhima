angular.module('bhima.services')
.service('FinancialService', FinancialService);

FinancialService.$inject = [ '$http', 'util' ];

function FinancialService ($http, util) {
  var service = this;
  var baseUrl = '/fee_centers/';

  service.readFeeCenter = readFeeCenter;
  service.getFeeValue = getFeeValue;

  function readFeeCenter(id, params) {
    var url = baseUrl.concat(id || '');
    return $http.get(baseUrl, { params : params })
      .then(util.unwrapHttpResponse);
  }

  //Gives the value of the charges of a cost center
  function getFeeValue(feeId) {
     var url = baseUrl + feeId + '/value';
     return $http.get(url)
     .then(util.unwrapHttpResponse);
  }

  return service;
}