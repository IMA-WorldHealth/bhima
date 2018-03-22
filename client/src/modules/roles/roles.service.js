angular.module('bhima.services')
  .service('RolesService', RolesService);

RolesService.$inject = [
  'PrototypeApiService',
];

/**
 * Account Service
 *
 * A service wrapper for the /accounts HTTP endpoint.
 */
function RolesService(Api) {
  const baseUrl = '/roles/';
  const service = new Api(baseUrl);

  service.affectPages = affectPages;

  service.unit = function unit(roleUuid) {
    return service.$http.get('/unit/'.concat(roleUuid));
  };

  service.list = function list(projectId) {
    const url = '/roles?project_id='.concat(projectId);
    return service.$http.get(url);
  };

  service.assignToUser = function assignToUser(data) {
    const url = '/roles/assignTouser';
    return service.$http.post(url, data);
  };

  service.userRoles = function userRoles(userId, projectId) {
    const url = '/roles/user/'.concat(userId, '/', projectId);
    return service.$http.get(url);
  };

  function affectPages(data) {
    return service.$http.post('/roles/affectUnits', data);
  }

  return service;
}
