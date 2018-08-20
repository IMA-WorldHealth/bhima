angular.module('bhima.services')
  .service('RolesService', RolesService);

RolesService.$inject = ['PrototypeApiService'];

/**
 * Role Service
 *
 * A service wrapper for the /roles HTTP endpoint.
 */
function RolesService(Api) {
  const service = new Api('/roles/');

  service.unit = function unit(roleUuid) {
    return service.$http.get('/unit/'.concat(roleUuid));
  };

  service.assignToUser = function assignToUser(data) {
    const url = '/roles/assignTouser';
    return service.$http.post(url, data);
  };

  service.userRoles = function userRoles(userId, projectId) {
    const url = `/roles/user/${userId}/${projectId}`;
    return service.$http.get(url);
  };

  service.actions = function actions(roleUuid) {
    const url = `/roles/actions/${roleUuid}`;
    return service.$http.get(url);
  };

  service.assignActions = function actions(data) {
    const url = `/roles/actions`;
    return service.$http.post(url, data);
  };

  service.userHasAction = function userHasAction(actionId) {
    const url = `/roles/actions/user/${actionId}`;
    return service.$http.get(url);
  };

  service.affectPages = function affectPages(data) {
    return service.$http.post('/roles/affectUnits', data);
  };

  return service;
}
