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

  service.list = function list() {
    return service.$http.get(baseUrl);
  };

  service.assignToUser = function assignToUser(data) {
    const url = '/roles/assignTouser';
    return service.$http.post(url, data);
  };

  service.userRoles = function userRoles(userId, projectId) {
    const url = '/roles/user/'.concat(userId, '/', projectId);
    return service.$http.get(url);
  };

  service.actions = function actions(roleUuid) {
    const url = '/roles/actions/'.concat(roleUuid);
    return service.$http.get(url);
  };

  service.assignActions = function actions(data) {
    const url = `/roles/actions`;
    return service.$http.post(url, data);
  };

  service.userHasAction = function userHasAction(actionId) {
    const url = '/roles/actions/user/'.concat(actionId);
    return service.$http.get(url);
  };

  function affectPages(data) {
    return service.$http.post('/roles/affectUnits', data);
  }

  return service;
}
