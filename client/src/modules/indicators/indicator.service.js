angular.module('bhima.services')
  .service('IndicatorService', IndicatorService);

IndicatorService.$inject = ['PrototypeApiService'];

/**
 * Indicator Service
 *
 * A service wrapper for the /indicators HTTP endpoint.
 */
function IndicatorService(Api) {

  const service = new Api('/indicators');
  service.hospitalization = new Api('/indicators/hospitalization');
  service.personel = new Api('/indicators/personel');
  service.fincances = new Api('/indicators/fincances');
  service.status = new Api('/indicators/status');

  return service;

}
