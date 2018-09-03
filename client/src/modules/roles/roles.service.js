angular.module('bhima.services')
  .service('RolesService', RolesService);

RolesService.$inject = ['PrototypeApiService'];

/**
 * Role Service
 *
 * A service wrapper for the /roles HTTP endpoint.
 *
 * @TODO(sfount) some routes on the Roles API server/client service aren't
 *               clear in English. These should be revised requiring a update
 *               across client, server and DB.
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

  /**
   * @method affectPages
   *
   * @description
   * Updates the route permissions that are assigned to a specific role. This
   * method is responsible for both removing existing and assigning new route
   * permissions to existing roles.
   *
   * It expects a `roleUuid` and a list of route permissions `unitIds`, the server
   * is responsible for determining which route permissions need to added or removed.
   *
   * @param {Object} data - the new role permission specification
   * @returns {Promise} - $http promise with API response
   */
  service.affectPages = function affectPages(data) {
    return service.$http.post('/roles/affectUnits', data);
  };

  return service;
}
