angular.module('bhima.routes')
  .config(['$stateProvider', ($stateProvider) => {
    $stateProvider

      .state('odk', {
        url         : '/odk/load_fosa_data',
        controller  : 'OdkController as OdkCtrl',
        templateUrl : 'modules/odk/odk.html',
      });

  }]);
