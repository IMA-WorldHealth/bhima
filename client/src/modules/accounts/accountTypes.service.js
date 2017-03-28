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
  var baseUrl = '/accounts/types/';

  service.getAccountType = getAccountType;
  service.getTypeText = getTypeText;

  /**
  *@helper
  * This Method return a list of Account Type
  **/
  function getAccountType(id, params) {
    var url = baseUrl.concat(id || '');
    return $http.get(url, { params : params })
    .then(util.unwrapHttpResponse);
  }

  /**
  *@helper
  * This Method return a text an Account Type
  **/
  function getTypeText(typeId, accountTypes){
    var accountText =  accountTypes.filter(function (item) {
      return item.id  === typeId;
    });

    return accountText[0].type;
  }

  return service;
}
