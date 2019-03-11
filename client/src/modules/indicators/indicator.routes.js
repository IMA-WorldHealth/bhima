angular.module('bhima.routes')
  .config(['$stateProvider', ($stateProvider) => {
    $stateProvider
      .state('indicators', {
        url : '/indicators',
        controller : 'IndicatorsController as Ctrl',
        templateUrl : 'modules/indicators/indicator.html',
        params : {
          filters : [],
        },
      });
  }]);
