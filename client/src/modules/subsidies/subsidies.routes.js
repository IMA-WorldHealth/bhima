angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider
      .state('subsidies', {
        url         : '/subsidies',
        controller  : 'SubsidyController as SubsidyCtrl',
        templateUrl : 'modules/subsidies/subsidies.html',
      });
  }]);
