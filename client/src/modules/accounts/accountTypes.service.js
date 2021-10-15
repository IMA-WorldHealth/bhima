angular.module('bhima.services')
  .service('AccountTypeService', AccountTypeService);

AccountTypeService.$inject = ['PrototypeApiService', '$http', 'util'];

/**
* Account Type Service
*
* A service wrapper for the /account_types HTTP endpoint.
*/
function AccountTypeService(Api, $http, util) {
  const baseUrl = '/accounts/types/';
  const service = new Api(baseUrl);

  service.getAccountType = getAccountType;
  service.getTypeText = getTypeText;

  /**
  * @helper
  * This Method return a list of Account Type
  * */
  function getAccountType(id, params) {
    const url = baseUrl.concat(id || '');
    return $http.get(url, { params })
      .then(util.unwrapHttpResponse);
  }

  /**
  * @helper
  * This Method return a text an Account Type
  * */
  function getTypeText(typeId, accountTypes) {
    const accountText = accountTypes.filter((item) => {
      return item.id === typeId;
    });

    return accountText[0].type;
  }

  return service;
}
