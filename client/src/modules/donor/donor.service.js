angular.module('bhima.services')
  .service('DonorService', DonorService);

DonorService.$inject = ['PrototypeApiService'];

/**
 * Role Service
 *
 * A service wrapper for the /donors HTTP endpoint.
 *
 */
function DonorService(Api) {
  const service = new Api('/donors/');
  return service;
}
