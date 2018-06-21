angular.module('bhima.routes')
  .config(['$stateProvider', $stateProvider => {
    $stateProvider
      .state('enterprises', {
        url : '/enterprises',
        controller : 'EnterpriseController as EnterpriseCtrl',
        templateUrl : 'modules/enterprises/enterprises.html',
      });
  }]);
