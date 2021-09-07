angular.module('bhima.services')
  .service('FeeCenterService', FeeCenterService);

FeeCenterService.$inject = ['PrototypeApiService'];

/**
 * @class FeeCenterService
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /fee_center/ URL.
 */
function FeeCenterService(Api) {
  const service = new Api('/fee_center/');

  function getAllocationBases() {
    const url = '/fee_center_allocations/bases';
    return service.$http.get(url)
      .then(service.util.unwrapHttpResponse);
  }
  service.getAllocationBases = getAllocationBases;

  function isTranslationToken(str) {
    const repat = /[A-Z_]+/;
    return repat.test(str);
  }
  service.isTranslationToken = isTranslationToken;

  return service;
}
