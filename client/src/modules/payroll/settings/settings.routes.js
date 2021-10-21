angular.module('bhima.routes')
  .config(['$stateProvider', $stateProvider => {

    $stateProvider.state('payroll_settings', {
      url : '/payroll/setting',
      templateUrl : 'modules/payroll/settings/settings.html',
      controller : 'PayrollSettingsController as PayrollSettingsCtrl',
      params : { filters : [] },
    });
  }]);
