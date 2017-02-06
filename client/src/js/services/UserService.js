angular.module('bhima.services')
.service('UserService', UserService);

UserService.$inject = [ '$http', 'util'];

/**
* User Service
*
* This service implements CRUD on the /users endpoint on the client.  It also
* provides convience wrappers for the API, wrapping
*/
function UserService($http, util) {
  var service = this;

  service.create = create;
  service.read = read;
  service.update = update;
  service.delete = del;
  service.permissions = permissions;
  service.projects = projects;
  service.updatePassword = updatePassword;
  service.updatePermissions = updatePermissions;
  service.validatePassword = validatePassword;

  /* ------------------------------------------------------------------------ */

  // create a new user in the database
  function create(user) {
    return $http.post('/users', user)
    .then(util.unwrapHttpResponse);
  }

  // reads users from the database.
  // if an id is supplied with return a single user. Otherwise it will return a
  // list of users.
  function read(id) {
    var url = (id) ? '/users/' + id : '/users';

    return $http.get(url)
      .then(util.unwrapHttpResponse);
  }

  // updates a user with id
  function update(id, user) {

    // delete properties that should not be updated
    delete user.lastLogin;
    delete user.id;
    delete user.active;

    return $http.put('/users/' + id, user)
    .then(util.unwrapHttpResponse);
  }

  // deletes a user with the given ID
  function del(id) {
    return $http.delete('/users/' + id)
    .then(util.unwrapHttpResponse);
  }

  // loads the user's permissions
  function permissions(id) {
    return $http.get('/users/' + id + '/permissions')
    .then(util.unwrapHttpResponse);
  }

  // loads the users's project permissions
  function projects(id) {
    return $http.get('/users/' + id + '/projects')
    .then(util.unwrapHttpResponse);
  }

  // sets a user's permissions using the public API
  function updatePermissions(id, data) {
    return $http.post('/users/' + id + '/permissions', { permissions : data })
    .then(util.unwrapHttpResponse);
  }

  // sets a user's password using the public API
  function updatePassword(id, data) {
    return $http.put('/users/' + id + '/password', data)
    .then(util.unwrapHttpResponse);
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
}
