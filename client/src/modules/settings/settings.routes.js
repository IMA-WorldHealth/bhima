angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider
      .state('settings', {
        url         : '/settings?previous',
        controller  : 'settings as SettingsCtrl',
        templateUrl : 'modules/settings/settings.html',
      });
  }]);
