angular.module('bhima.routes')
  .config(['$stateProvider', installStateProvider]);

function installStateProvider($stateProvider) {
  $stateProvider
    .state('install', {
      url : '/install',
      controller : 'InstallApplicationController as InstallCtrl',
      templateUrl : 'modules/install/install.html',
    });
}
