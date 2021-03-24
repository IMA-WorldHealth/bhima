angular.module('bhima.services')
  .service('CdrDepotService', CdrDepotService);

CdrDepotService.$inject = ['PrototypeApiService'];

/**
 * @class DepotService
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /depots/ URL.
 */
function CdrDepotService(Api) {
  const baseUrl = '/cdr_reporting/depots/';
  const service = new Api(baseUrl);
  return service;
}
