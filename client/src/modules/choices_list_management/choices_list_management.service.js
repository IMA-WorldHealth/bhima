angular.module('bhima.services')
  .service('ChoicesListManagementService', ChoicesListManagementService);

ChoicesListManagementService.$inject = ['PrototypeApiService'];

/**
 * @class ChoicesListManagementService
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /choices_list_management/ URL.
 */
function ChoicesListManagementService(Api) {
  const service = new Api('/choices_list_management/');

  return service;
}
