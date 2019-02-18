angular.module('bhima.routes')
  .config(['$stateProvider', $stateProvider => {
    $stateProvider
      .state('ward', {
        url         : '/ward',
        controller  : 'WardController as WardCtrl',
        templateUrl : 'modules/ward/ward.html',
      });
  }]);
