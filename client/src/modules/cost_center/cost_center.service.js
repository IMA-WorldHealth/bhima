angular.module('bhima.services')
  .service('CostCenterService', CostCenterService);

CostCenterService.$inject = ['PrototypeApiService'];

/**
 * @class CostCenterService
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /cost_center/ URL.
 */
function CostCenterService(Api) {
  const service = new Api('/cost_center/');

  return service;
}
