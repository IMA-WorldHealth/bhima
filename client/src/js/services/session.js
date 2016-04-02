angular.module('bhima.services')
.service('SessionService', SessionService);

SessionService.$inject = [
  '$sessionStorage', '$http', '$location', 'util'
];

/**
 * Session Service
 *
 * This service is responsible for retaining the client's session in session
 * storage.  It contains the methods for login and logout.
 *
 * @module services/SessionService.js
 * @constructor
 */
function SessionService($sessionStorage, $http, $location, util) {
  var service = this;

  // set up the storage instance
  $sessionStorage['client-session'] = $sessionStorage['client-session'] || {};
  var $storage = $sessionStorage['client-session'];

  // creates a new session instance from the cached storage
  service.create = create;

  // unsets the values for the session variables
  service.destroy = destroy;

  // login http method
  service.login = login;

  // logout http method
  service.logout = logout;

  // set the user, enterprise, and project for the session
  // this should happen right after login
  function create(user, enterprise, project) {
    $storage.user = user;
    $storage.enterprise = enterprise;
    $storage.project = project;

    // update bindings
    load();
  }

  /** unsets a user's session, destroying */
  function destroy() {
    delete $storage.user;
    delete $storage.enterprise;
    delete $storage.project;

    // update bindings
    load();

    $location.url('/login');
  }

  /**
   * attempt to log the user into the server and create a client session
   *
   * @param {Object} credentials - the credentials to be submitted to the
   *   server, including username and password
   * @return {Promise} promise - a HTTP promise fulfilled with the user session
   */
  function login(credentials) {
    /** @todo - should the login reject if a user is already logged in? */
    return $http.post('/login', credentials)
      .then(util.unwrapHttpResponse)
      .then(function (session) {

        // create the user session in the $storage
        create(session.user, session.enterprise, session.project);

        // navigate to the main page
        $location.url('/');

        return session;
      });
  }

  /**
   * logs the user out of the server and destroys their client-side session.
   *
   * @return {Promise} promise - the HTTP logout promise
   */
  function logout() {
    return $http.get('/logout')
      .then(function () {

        // destro the user's session from $storage
        destroy();

        // navigate to the main page
        $location.url('/login');
      });
  }

  /** binds the user's session parameters to the storage ones */
  function load() {
    service.user = $storage.user;
    service.enterprise = $storage.enterprise;
    service.project = $storage.project;
  }

  // initialize loading to see if the user is already logged in
  load();
}
