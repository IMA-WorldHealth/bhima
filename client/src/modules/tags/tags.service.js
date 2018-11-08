angular.module('bhima.services')
  .service('TagsService', TagsService);

TagsService.$inject = ['PrototypeApiService'];

/**
 * Tags Service
 *
 * A service wrapper for the /tags HTTP endpoint.
 */
function TagsService(Api) {
  const service = new Api('/tags/');
  return service;
}
