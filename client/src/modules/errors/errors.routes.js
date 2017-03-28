angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider
      .state('403', {
        templateUrl : 'modules/errors/403.html',
      })

      // this is a catch-all state.  It matches all URLs and preserves the URL in the top bar.
      .state('404', {
        url         : '{path:.*}',
        templateUrl : 'modules/errors/404.html',
      });
  }]);
