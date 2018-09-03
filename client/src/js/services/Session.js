angular.module('bhima.services')
  .service('SessionService', SessionService);

SessionService.$inject = [
  '$sessionStorage', '$http', '$state', 'util', '$rootScope', '$q',
];

/**
 * @module SessionService
 *
 * @description
 * This service is responsible for retaining the client's session in session
 * storage.  It contains the methods for login and logout.
 *
 * If any service/component needs to be alerted of a change in login state, the
 * SessionService emits two events: 'login' and 'logout' via $rootScope that can
 * be listened to throughout the application.  Currently, only
 * ApplicationController consumes these events.
 *
 * @constructor
 */
function SessionService($sessionStorage, $http, $state, util, $rootScope, $q) {
  const service = this;

  // set up the storage instance
  $sessionStorage['client-session'] = $sessionStorage['client-session'] || {};
  const $storage = $sessionStorage['client-session'];

  // creates a new session instance from the cached storage
  service.create = create;

  // unsets the values for the session variables
  service.destroy = destroy;

  // login http method
  service.login = login;

  // logout http method
  service.logout = logout;

  // reloads a user's session
  service.reload = reload;

  service.isSettingEnabled = isSettingEnabled;

  // set the user, enterprise, and project for the session
  // this should happen right after login
  function create(user, enterprise, project, paths) {
    $storage.user = user;
    $storage.enterprise = enterprise;
    $storage.project = project;
    $storage.paths = paths;

    // update bindings
    load();
  }

  /** unsets a user's session, destroying */
  function destroy() {
    delete $storage.user;
    delete $storage.enterprise;
    delete $storage.project;
    delete $storage.paths;

    // update bindings
    load();

    // TODO - use $state
    $state.go('login');
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
    return $http.post('/auth/login', credentials)
      .then(util.unwrapHttpResponse)
      .then(session => {

        // create the user session in the $storage
        create(session.user, session.enterprise, session.project, session.paths);

        // navigate to the main page
        $state.go('index');

        // notify login event
        $rootScope.$emit('session:login');

        return session;
      });
  }

  /**
   * logs the user out of the server and destroys their client-side session.
   *
   * @return {Promise} promise - the HTTP logout promise
   */
  function logout() {
    return $http.get('/auth/logout')
      .then(() => {

        // destroy the user's session from $storage
        destroy();

        // notify the logout event
        $rootScope.$emit('session:logout');

        // navigate to the main page
        $state.go('login');
      });
  }

  /** binds the user's session parameters to the storage ones */
  function load() {
    service.user = $storage.user;
    service.enterprise = $storage.enterprise;
    service.project = $storage.project;
    service.paths = $storage.paths;
  }

  function reload() {
    if ($storage.user) {
      return $http.post('/auth/reload', { username : $storage.user.username })
        .then(util.unwrapHttpResponse)
        .then((session) => {

          // re-create the user session in the $storage
          create(session.user, session.enterprise, session.project, session.paths);

          // tell the tree to re-download a user's units
          $rootScope.$emit('session:reload');
        });
    }

    return $q.resolve();
  }

  /**
   * @method isSettingEnabled
   *
   * @description
   * Checks if a setting is enabled on the enterprise.
   *
   * @param {string} [setting] - the key of the enterprise setting to check.
   *
   * @returns {boolean<result>} - true if setting is enabled.
   */
  function isSettingEnabled(setting) {
    return service.enterprise.settings[`enable_${setting}`];
  }

  // if the $rootScope emits 'session.destroy', destroy the session
  $rootScope.$on('session:destroy', destroy);

  // initialize loading to see if the user is already logged in
  load();
}
