angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider
      .state('login', {
        url         : '/login',
        controller  : 'LoginController as LoginCtrl',
        templateUrl : 'modules/login/login.html',
      });
  }]);
