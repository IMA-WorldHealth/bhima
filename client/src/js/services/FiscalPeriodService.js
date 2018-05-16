angular.module('bhima.services')
.service('FiscalPeriodService', FiscalPeriodService);

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
  const service = new Api('/periods');
  service.currentPeriod = currentPeriod;

  /**
   *
   * @method currentPeriod
   * @description
   * return the current period'id
   */
  function currentPeriod() {
    const url = `/periods/current`;
    return service.$http.get(url)
      .then(service.util.unwrapHttpResponse);
  }

  return service;
}
