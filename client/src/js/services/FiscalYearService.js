angular.module('bhima.services')
.service('FiscalService', FiscalService);

FiscalService.$inject = ['PrototypeApiService'];

/**
 * Fiscal Service
 *
 * This service is responsible for loading the Fiscal Years and Periods, as well
 * as providing metadata like period totals, opening balances and such.
 */
function FiscalService(PrototypeApiService) {
  var service = this;

  // inherit from the PrototypeApiService
  angular.extend(service, PrototypeApiService);

  // the service URL
  service.url = '/fiscal/';

  return service;
}
