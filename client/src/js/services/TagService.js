angular.module('bhima.services')
  .service('TagService', TagService);

TagService.$inject = ['PrototypeApiService', 'util'];

/**
 * @class TagService
 * @extends PrototypeApiService
 *
 * @description
 * Encapsulates common requests to the /tags/ URL.
 */
function TagService(Api, util) {
  const baseUrl = '/tags/';
  const service = new Api(baseUrl);
  service.types = new Api(baseUrl.concat('types/'));

  const tagKeys = ['uuid', 'name', 'color'];
  service.clean = tag => util.maskObjectFromKeys(tag, tagKeys);

  return service;
}
