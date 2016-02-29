angular.module('bhima.services')
.service('FinancialService', FinancialService);

FinancialService.$inject = [ '$http', 'util' ];

function FinancialService ($http, util) {
  var service = this;

  service.readCostCenter = readCostCenter;
  service.readProfitCenter = readProfitCenter;
  service.getCostCenter = getCostCenter;
  service.getProfitCenter = getProfitCenter;

  // this will read all cost centers
  function readCostCenter(id, params) {
     var url = '/cost_centers/';
     return $http.get(url, { params : params })
     .then(util.unwrapHttpResponse);
  }

  // this will read all Profit Centers
  function readProfitCenter(id, params) {
     var url = '/profit_centers/';
     return $http.get(url, { params : params })
     .then(util.unwrapHttpResponse);
  }

  //Gives the value of the charges of a cost center
  function getCostCenter(projectId , ccId) {
     var url = '/cost/' + projectId + '/' + ccId;
     return $http.get(url)
     .then(util.unwrapHttpResponse);
  }

  //Gives the value of products of a profit center
  function getProfitCenter(projectId , pcId) {
     var url = '/profit/' + projectId + '/' + pcId;
     return $http.get(url)
     .then(util.unwrapHttpResponse);
  }

  return service;
}