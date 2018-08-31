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
function FeeCenterService(Api, Modal) {
  const service = new Api('/fee_center/');

  return service;
}
