angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider
      .state('reportsBase', {
        url : '/reports/:key',
        controller : 'ReportsController as ReportCtrl',
        templateUrl : 'modules/reports/reports.html'
       });
 }]);

