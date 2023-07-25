angular.module('bhima.services')
  .service('TitleService', TitleService);

TitleService.$inject = ['PrototypeApiService'];

/**
 * @class TitleService
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /titles/ URL.
 */
function TitleService(Api) {
  const service = new Api('/titles/');

  return service;
}
