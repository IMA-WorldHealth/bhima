angular.module('bhima.services')
  .service('AllocationBasisService', AllocationBasisService);

AllocationBasisService.$inject = ['PrototypeApiService'];

/**
 * @class AllocationBasisService
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /cost_center/ URL.
 */
function AllocationBasisService(Api) {
  const service = new Api('/cost_center_allocation_basis/');

  service.getAllocationBases = getAllocationBases;

  function getAllocationBases() {
    const url = '/cost_center_allocation_basis';
    return service.$http.get(url)
      .then(service.util.unwrapHttpResponse);
  }

  return service;
}
