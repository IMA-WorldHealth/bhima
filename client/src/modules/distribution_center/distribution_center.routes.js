angular.module('bhima.routes')
  .config(['$stateProvider', $stateProvider => {
    $stateProvider
      .state('distribution_center', {
        url         : '/distribution_center',
        controller  : 'DistributionCenterController as DistributionCenterCtrl',
        templateUrl : 'modules/distribution_center/distribution_center.html',
        params : {
          filters : [],
        },
      })

      .state('update_distribution_center', {
        url : '/distribution_center/update',
        controller  : 'UpdateCenterController as UpdateCenterCtrl',
        templateUrl : 'modules/distribution_center/update/update_center.html',
        params : {
          filters : [],
        },
      });
  }]);
