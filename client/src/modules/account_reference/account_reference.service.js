angular.module('bhima.services')
  .service('AccountReferenceService', AccountReferenceService);

AccountReferenceService.$inject = ['PrototypeApiService'];

/**
* Account Reference Service
*
* This service implements CRUD on the /account_reference endpoint on the client
*/
function AccountReferenceService(Api) {
  const service = Api('/accounts/references/');
  return service;
}
