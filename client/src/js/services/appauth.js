angular.module('bhima.services')
.service('appauth', AppAuth);

AppAuth.$inject = [
  '$q', '$http', '$window', '$location', 'appstate'
];

function AppAuth($q, $http, $window, $location, appstate) {
  var session;
  var service = {};

  if ($window.sessionStorage.session) {
    session = JSON.parse($window.sessionStorage.session);
  }

  service.login = function login(credentials) {
    return $http.post('/auth/login', credentials)
    .then(function (res) {

      session = {
        token : res.data.accessToken,
        data  : res.data.userData
      };

      // TODO -- do we even still use this?
      appstate.set('user', session.data);
      $window.sessionStorage.session = JSON.stringify(session);

      return session;
    });
  };

  service.logout = function logout() {
    return $http.get('/auth/logout')
    .then(function (res) {
      delete $window.sessionStorage.session;
      session = null;
      return res;
    });
  };

  service.isAuthenticated = function () {
    return !!session && !!session.token;
  };

  service.getSession = function () {
    return session;
  };

  service.destroySession = function () {
    delete $window.sessionStorage.session;
    session = null;

  };

  return service;
}
