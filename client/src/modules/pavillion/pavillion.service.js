angular.module('bhima.services')
  .service('PavillionService', PavillionService);

PavillionService.$inject = ['PrototypeApiService'];

/**
 * @class PavillionService
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /Pavions/ URL.
 */
function PavillionService(Api) {
  const service = new Api('/pavillions/');

  return service;
}
