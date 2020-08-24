angular.module('bhima.services')
  .service('DonationService', DonationService);

DonationService.$inject = ['PrototypeApiService'];

/**
 * Role Service
 *
 * A service wrapper for the /donors HTTP endpoint.
 *
 */
function DonationService(Api) {
  const service = new Api('/donations/');
  return service;
}
