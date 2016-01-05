angular.module('bhima.services')
.service('SessionService', ['$window', function ($window) {
  var self = this,
      key = 'bhima-session-key';

  // loads up a session if it exists
  // NOTE - we are using $window.sessionStorage
  // rather than localForage because we want immediate
  // responses.
  self.loadStoredSession = function () {
    try {
      var session = JSON.parse($window.sessionStorage.getItem(key));
      if (session) { self.create(session.user, session.enterprise, session.project); }
    } catch (e) {}
  };

  // set the user, enterprise, and project for the session
  // this should happen right after login
  self.create = function (user, enterprise, project) {
    self.user = user;
    self.enterprise = enterprise;
    self.project = project;
    $window.sessionStorage.setItem(key, JSON.stringify({ user : user, enterprise: enterprise, project : project }));
  };

  // unsets the values for the session variables
  self.destroy = function () {
    self.user       = undefined;
    self.enterprise = undefined;
    self.project    = undefined;
    $window.sessionStorage.setItem(key, '{}');
  };

  // check and see if we have a session stored -
  // this is in case we have "refreshed" the page
  self.loadStoredSession();
}]);
