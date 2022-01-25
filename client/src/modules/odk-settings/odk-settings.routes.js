angular.module('bhima.routes')
  .config(['$stateProvider', $stateProvider => {
    $stateProvider
      .state('odkSettings', {
        url         : '/admin/odk-settings',
        controller  : 'ODKSettingsController as ODKSettingsCtrl',
        templateUrl : 'modules/odk-settings/odk-settings.html',
      });
  }]);
