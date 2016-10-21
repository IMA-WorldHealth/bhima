angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider
      .state('reportsBase', {
        url : '/reports/:key',
        controller : 'ReportsController as ReportCtrl',
        templateUrl : 'partials/reports/reports.html'
       })
 }]);

