angular.module('bhima.services')
  .service('StaffingIndiceService', StaffingIndiceService);

StaffingIndiceService.$inject = ['PrototypeApiService'];

/**
 * staffing indices Service
 *
 * A service wrapper for the /staffing_indices HTTP endpoint.
 *
 */
function StaffingIndiceService(Api) {
  const service = new Api('/staffing_indices/');
  return service;
}
