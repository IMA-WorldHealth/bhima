angular.module('bhima.services')
.service('AccountCategoryService', AccountCategoryService);

AccountCategoryService.$inject = [
  'PrototypeApiService', '$http', 'util',
];

/**
* Account Category Service
*
* A service wrapper for the /account/categories HTTP endpoint.
*/
function AccountCategoryService(Api) {
  var baseUrl = '/accounts/categories/';
  var service = new Api(baseUrl);

  return service;
}
