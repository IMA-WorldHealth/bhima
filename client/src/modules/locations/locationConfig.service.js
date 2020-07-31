angular.module('bhima.services')
  .service('LocationConfigurationService', LocationConfigurationService);

LocationConfigurationService.$inject = ['PrototypeApiService'];

/**
 * @class Location Configuration Service
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /grades/ URL.
 */
function LocationConfigurationService(Api) {
  const service = new Api('/locations/readLocations/');

  return service;
}
