angular.module('bhima.controllers')
.controller('UtilController', [
  '$scope',
  '$location',
  '$http',
  'SessionService',
  function($scope, $location, $http, SessionService) {
    // Controls the visibility and actions of the utilities
    // on the application's sidebar

    this.openSettings = function () {
      var last = $location.path();
      $location.path('/settings/').search('url', last);
    };

    this.logout = function () {
      $http.get('/logout')
      .then(function () {
        SessionService.destroy();
        $location.url('/login');
      });
    };
  }
]);
