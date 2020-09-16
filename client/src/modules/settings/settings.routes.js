angular.module('bhima.routes')
  .config(['$stateProvider', $stateProvider => {
    $stateProvider
      .state('settings', {
        url         : '/settings',
        controller  : 'settings as SettingsCtrl',
        templateUrl : 'modules/settings/settings.html',
        data : { allowAuthPassthrough : true },
      });
  }]);
