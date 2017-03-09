angular.module('bhima.routes')
  .config(['$stateProvider', function ($stateProvider) {
    // a list of all supported reported and their respective keys, this allows
    // the ui-view to be populated with the correct report configuration form
    /* @const */
    var SUPPORTED_REPORTS = [
      'report_accounts'
    ];

    $stateProvider
      .state('reportsBase', {
        url : '/reports',
        controller : 'ReportsController as ReportCtrl',
        templateUrl : 'partials/reports/reports.html',
        resolve : {
          reportData : ['$stateParams', 'BaseReportService', function ($stateParams, SavedReports) {
            var reportKey = $stateParams.key;
            return SavedReports.requestKey(reportKey)
              .then(function (results) { return results[0]; });
          }]
        },
        abstract : true
       })
       .state('reportsBase.reportsArchive', {
         url : '/:key/archive',
         controller : 'ReportsArchiveController as ArchiveCtrl',
         templateUrl : 'partials/reports/archive.html'
       });

       SUPPORTED_REPORTS.forEach(function (key) {
          $stateProvider.state('reportsBase.'.concat(key), {
            url : '/'.concat(key, '/preview'),
            controller : key.concat('Controller as ReportConfigCtrl'),
            templateUrl : '/partials/reports/generate/'.concat(key, '.html'),
            params : { key : key }
          });
       });
 }]);

