angular.module('bhima.services')
  .service('RubricService', RubricService);

RubricService.$inject = ['PrototypeApiService', '$uibModal'];

/**
 * @class RubricService
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /rubrics/ URL.
 */
function RubricService(Api, Modal) {
  var service = new Api('/rubrics/');

  return service;
}