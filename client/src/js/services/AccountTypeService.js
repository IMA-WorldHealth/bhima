angular.module('bhima.services')
.service('AccountTypeService', AccountTypeService);

AccountTypeService.$inject = ['$http', 'util', 'SessionService'];

/**
* Account Service
*
* A service wrapper for the /accounts HTTP endpoint.  
*/
function AccountTypeService($http, util, sessionService) {
  var service = this;
  var baseUrl = '/account_types/';

  service.getAccountType = getAccountType;

  /**
  *@helper  
  * This Method return a list of Account Type
  **/
  function getAccountType(id, params) {
     return $http.get(baseUrl, { params : params })
     .then(util.unwrapHttpResponse);
  }

  return service;
}
