angular.module('bhima.services')
  .service('FeeCenterService', FeeCenterService);

FeeCenterService.$inject = ['PrototypeApiService', '$uibModal'];

/**
 * @class FeeCenterService
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /fee_center/ URL.
 */
function FeeCenterService(Api, $uibModal) {
  const service = new Api('/fee_center/');

  service.getAllocationBasisDetails = (id) => {
    const url = `/fee_center_allocation_basis/${id}`;
    return service.$http.get(url)
      .then(service.util.unwrapHttpResponse);
  };

  service.createUpdateAllocationBasis = (id) => {
    return $uibModal.open({
      templateUrl : '/modules/fee_center/modals/createUpdateAllocationBasis.modal.html',
      controller : 'AllocationBasisModalController as ModalCtrl',
      resolve : { data : () => id },
    });
  };

  return service;
}
