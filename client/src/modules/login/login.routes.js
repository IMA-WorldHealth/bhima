angular.module('bhima.routes')
  .config(['$stateProvider', ($stateProvider) => {
    $stateProvider
      .state('login', {
        url         : '/login',
        controller  : 'LoginController as LoginCtrl',
        templateUrl : 'modules/login/login.html',
        data : { isLoginState : true, allowAuthPassthrough : true },
      });
  }]);
