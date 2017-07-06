angular.module('bhima.services')
.service('FisaclPeriodService', FiscalPeriodService);

FiscalPeriodService.$inject = [ 'PrototypeApiService' ];

/**
 * @class FiscalPeriodService
 * @extends PrototypeApiService
 *
 * This service is responsible for loading the Periods.
 *
 * @requires PrototypeApiService
 */
function FiscalPeriodService(Api) {

  // extend the PrototypeApiService with period routes
  var service = new Api('/periods');
  return service;
}
