angular.module('bhima.services')
  .service('UserService', UserService);

UserService.$inject = ['PrototypeApiService'];

/**
* User Service
*
* @description
* This service implements CRUD on the /users endpoint on the client.
*/
function UserService(Api) {
  const service = new Api('/users/');

  service.update = update;
  service.projects = projects;
  service.depots = depots;
  service.cashboxes = cashboxes;
  service.updatePassword = updatePassword;
  service.updatePermissions = updatePermissions;
  service.validatePassword = validatePassword;
  service.updateDepots = updateDepots;
  service.cashBoxManagement = cashBoxManagement;

  /* ------------------------------------------------------------------------ */

  // updates a user with id
  function update(id, user) {

    // delete properties that should not be updated
    delete user.lastLogin;
    delete user.id;
    delete user.active;

    return service.$http.put(`/users/${id}`, user)
      .then(service.util.unwrapHttpResponse);
  }

  // loads the users's project permissions
  function projects(id) {
    return service.$http.get(`/users/${id}/projects`)
      .then(service.util.unwrapHttpResponse);
  }

  // loads the users's depot permissions
  function depots(id) {
    return service.$http.get(`/users/${id}/depots`)
      .then(service.util.unwrapHttpResponse);
  }

  // loads the users's cashbox permissions
  function cashboxes(id) {
    return service.$http.get(`/users/${id}/cashboxes`)
      .then(service.util.unwrapHttpResponse);
  }

  // sets a user's permissions using the public API
  function updatePermissions(id, data) {
    return service.$http.post(`/users/${id}/permissions`, { permissions : data })
      .then(service.util.unwrapHttpResponse);
  }

  // sets a user's Depot Management using the public API
  function updateDepots(id, data) {
    return service.$http.post(`/users/${id}/depots`, { depots : data })
      .then(service.util.unwrapHttpResponse);
  }

  // sets a user's Cashbox Management using the public API
  function cashBoxManagement(id, data) {
    return service.$http.post(`/users/${id}/cashboxes`, { cashboxes : data })
      .then(service.util.unwrapHttpResponse);
  }

  // sets a user's password using the public API
  function updatePassword(id, data) {
    return service.$http.put(`/users/${id}/password`, data)
      .then(service.util.unwrapHttpResponse);
  }

  /**
   * @function validatePassword
   *
   * @param {String} passwordA - a user password
   * @param {String} passwordB - a challenge password
   *
   * @description
   * This function exists to validate password inputs where two passwords are
   * required and must be equal.  This is involved in updating/creating a user
   * password to ensure that the password is correctly memorized by the user..
   */
  function validatePassword(passwordA, passwordB) {
    return passwordA && passwordA.length && passwordA === passwordB;
  }

  return service;
}
