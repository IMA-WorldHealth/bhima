angular.module('bhima.services')
.service('AccountTypeService', AccountTypeService);

AccountTypeService.$inject = ['$http', 'util'];

/**
* Account Type Service
*
* A service wrapper for the /account_types HTTP endpoint.  
*/
function AccountTypeService($http, util) {
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
