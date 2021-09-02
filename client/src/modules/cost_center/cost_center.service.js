angular.module('bhima.services')
  .service('CostCenterService', CostCenterService);

CostCenterService.$inject = ['PrototypeApiService', '$uibModal'];

/**
 * @class CostCenterService
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /cost_center/ URL.
 */
function CostCenterService(Api, $uibModal) {
  const service = new Api('/cost_center/');

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
