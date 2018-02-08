angular.module('bhima.services')
  .service('ConfigurationAccountService', ConfigurationAccountService);

ConfigurationAccountService.$inject = ['PrototypeApiService', '$uibModal'];

/**
 * @class ConfigurationAccountService
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /rubric_config/ URL.
 */
function ConfigurationAccountService(Api, Modal) {
  var service = new Api('/account_config/');

  return service;
}