angular.module('bhima.services')
  .service('IndicatorService', IndicatorService);

IndicatorService.$inject = ['PrototypeApiService'];

/**
 * Indicator Service
 *
 * A service wrapper for the /indicators HTTP endpoint.
 */
function IndicatorService(Api) {
  const service = this;
  service.hospitalization = new Api('/indicators/hospitalization');
  service.personel = new Api('/indicators/personel');
  service.fincance = new Api('/indicators/fincance');
  service.status = new Api('/indicators/status');
  return service;
}
