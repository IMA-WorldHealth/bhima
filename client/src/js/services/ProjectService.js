angular.module('bhima.services')
.service('ProjectService', ProjectService);

ProjectService.$inject = [ '$http', 'util' ];

/**
 * Project Service
 *
 * This service implements basic CRUD functionality on the project table in the
 * backend database.
 *
 * @module services/ProjectService
 */
function ProjectService($http, util) {
  var service = this;
  var baseUrl = '/projects/';

  service.create = create;
  service.read = read;
  service.update = update;
  service.delete = del;

  function create(project) {
    return $http.post(baseUrl, project)
    .then(util.unwrapHttpResponse);
  }

  function read(id, params) {
     var url = baseUrl.concat(id || '');
     return $http.get(url, { params : params })
     .then(util.unwrapHttpResponse);
  }

  function update(id, project) {
    return $http.put(baseUrl.concat(id), project)
    .then(util.unwrapHttpResponse);
  }

  function del(id) {
    return $http.delete(baseUrl.concat(id))
    .then(util.unwrapHttpResponse);
  }
}
