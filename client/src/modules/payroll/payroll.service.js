angular.module('bhima.services')
  .service('PayrollConfigurationService', PayrollConfigurationService);

PayrollConfigurationService.$inject = ['PrototypeApiService'];

/**
 * @class PayrollConfigurationService
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /payroll_config/ URL.
 */
function PayrollConfigurationService(Api) {
  var service = new Api('/payroll_config/');

  return service;
}