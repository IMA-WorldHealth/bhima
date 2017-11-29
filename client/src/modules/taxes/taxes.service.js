angular.module('bhima.services')
  .service('TaxService', TaxService);

TaxService.$inject = ['PrototypeApiService', '$uibModal'];

/**
 * @class TaxService
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /taxes/ URL.
 */
function TaxService(Api, Modal) {
  var service = new Api('/taxes/');

  return service;
}