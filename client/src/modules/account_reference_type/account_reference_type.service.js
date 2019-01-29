angular.module('bhima.services')
  .service('AccountReferenceTypeService', AccountReferenceTypeService);

AccountReferenceTypeService.$inject = ['PrototypeApiService'];

/**
 * @class AccountReferenceTypeService
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /account_reference_type/ URL.
 */
function AccountReferenceTypeService(Api) {
  const service = new Api('/account_reference_type/');

  return service;
}
