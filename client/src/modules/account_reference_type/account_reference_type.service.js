angular.module('bhima.services')
  .service('AccountReferenceTypeService', AccountReferenceTypeService);

AccountReferenceTypeService.$inject = ['PrototypeApiService', '$translate'];

/**
 * @class AccountReferenceTypeService
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /account_reference_type/ URL.
 */
function AccountReferenceTypeService(Api, $translate) {
  const service = new Api('/account_reference_type/');

  service.translateLabel = translateLabel;

  function translateLabel(data) {
    data.forEach((item) => {
      item.label = $translate.instant(item.label);
    });

    return data;
  }

  return service;
}
