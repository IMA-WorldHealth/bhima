angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider
      .state('services', {
        url         : '/services',
        controller  : 'ServicesController as ServicesCtrl',
        templateUrl : 'modules/services/services.html',
      });
  }]);
