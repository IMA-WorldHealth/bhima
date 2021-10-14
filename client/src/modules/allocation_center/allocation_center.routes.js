angular.module('bhima.routes')
  .config(['$stateProvider', $stateProvider => {
    $stateProvider
      .state('allocation_center', {
        url         : '/allocation_center',
        controller  : 'DistributionCenterController as DistributionCenterCtrl',
        templateUrl : 'modules/allocation_center/allocation_center.html',
        params : {
          filters : [],
        },
      })

      .state('allocation_key', {
        url : '/allocation_center/allocation_key',
        controller  : 'DistributionKeyController as DistributionKeyCtrl',
        templateUrl : 'modules/allocation_center/allocation_key/allocation_key.html',
      })

      .state('update_allocation_center', {
        url : '/allocation_center/update',
        controller  : 'UpdateCenterController as UpdateCenterCtrl',
        templateUrl : 'modules/allocation_center/update/update_center.html',
        params : {
          filters : [],
        },
      });
  }]);
