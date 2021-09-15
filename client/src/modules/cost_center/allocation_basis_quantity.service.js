angular.module('bhima.services')
  .service('AllocationBasisQuantityService', AllocationBasisQuantityService);

AllocationBasisQuantityService.$inject = ['PrototypeApiService'];

/**
 * @class AllocationBasisQuantityService
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /fee_center_allocation_basis_quantity/ URL.
 */
function AllocationBasisQuantityService(Api) {
  const service = new Api('/cost_center_allocation_basis_quantity/');
  return service;
}
