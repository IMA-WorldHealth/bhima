angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider
      .state('depots', {
        url         : '/depots',
        controller  : 'DepotManagementController as DepotCtrl',
        templateUrl : 'modules/depots/depots.html',
      });
  }]);
