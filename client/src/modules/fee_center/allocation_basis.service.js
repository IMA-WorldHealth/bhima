angular.module('bhima.services')
  .service('AllocationBasisService', AllocationBasisService);

AllocationBasisService.$inject = ['PrototypeApiService'];

/**
 * @class AllocationBasisService
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /fee_center/ URL.
 */
function AllocationBasisService(Api) {
  const service = new Api('/fee_center_allocation_basis/');

  service.getAllocationBases = getAllocationBases;

  function getAllocationBases() {
    const url = '/fee_center_allocation_basis';
    return service.$http.get(url)
      .then(service.util.unwrapHttpResponse);
  }

  return service;
}
