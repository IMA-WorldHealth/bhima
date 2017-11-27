angular.module('bhima.services')
  .service('FunctionService', FunctionService);

FunctionService.$inject = ['PrototypeApiService', '$uibModal'];

/**
 * @class FunctionService
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /functions/ URL.
 */
function FunctionService(Api, Modal) {
  var service = new Api('/functions/');

  return service;
}
