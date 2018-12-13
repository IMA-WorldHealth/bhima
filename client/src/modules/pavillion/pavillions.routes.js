angular.module('bhima.routes')
  .config(['$stateProvider', $stateProvider => {
    $stateProvider
      .state('pavillions', {
        url         : '/pavillions',
        controller  : 'PavillionController as PavillionCtrl',
        templateUrl : 'modules/pavillion/pavillion.html',
      });
  }]);
