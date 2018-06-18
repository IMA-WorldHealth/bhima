angular.module('bhima.routes')
  .config(['$stateProvider', $stateProvider => {
    $stateProvider
      .state('enterprises', {
        abstract : true,
        url : '/enterprises',
        controller : 'EnterpriseController as EnterpriseCtrl',
        templateUrl : 'modules/enterprises/enterprises.html',
      });
  }]);
