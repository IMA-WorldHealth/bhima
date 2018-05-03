angular.module('bhima.services')
  .service('OffdayService', OffdayService);

OffdayService.$inject = ['PrototypeApiService', '$uibModal'];

/**
 * @class OffdayService
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /offdays/ URL.
 */
function OffdayService(Api, Modal) {
  const service = new Api('/offdays/');

  return service;
}
