angular.module('bhima.routes')
  .config(['$stateProvider', function Provider($stateProvider) {

    $stateProvider.state('donors', {
      url : '/donors',
      templateUrl : 'modules/donor/donor.html',
      controller : 'DonorController as DonorCtrl',
    });
  }]);
