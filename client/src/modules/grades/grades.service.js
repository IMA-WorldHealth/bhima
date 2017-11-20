angular.module('bhima.services')
  .service('GradeService', GradeService);

GradeService.$inject = ['PrototypeApiService', '$uibModal'];

/**
 * @class GradeService
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /grades/ URL.
 */
function GradeService(Api, Modal) {
  var service = new Api('/grades/');

  return service;
}
