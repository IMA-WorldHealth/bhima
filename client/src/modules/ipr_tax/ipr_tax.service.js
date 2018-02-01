angular.module('bhima.services')
  .service('IprTaxService', IprTaxService);

IprTaxService.$inject = ['PrototypeApiService', '$uibModal'];

/**
 * @class IprTaxService
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /iprTaxes/ URL.
 */
function IprTaxService(Api, Modal) {
  var service = new Api('/iprTax/');

  return service;
}
