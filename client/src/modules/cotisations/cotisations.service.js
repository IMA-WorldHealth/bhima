angular.module('bhima.services')
  .service('CotisationService', CotisationService);

CotisationService.$inject = ['PrototypeApiService', '$uibModal'];

/**
 * @class CotisationService
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /cotisations/ URL.
 */
function CotisationService(Api, Modal) {
  var service = new Api('/cotisations/');

  return service;
}
