angular.module('bhima.services')
  .service('BaseReportService', BaseReportService);

BaseReportService.$inject = ['$http', '$uibModal', 'util'];

function BaseReportService($http, Modal, util) {
  var service = this;

  service.requestKey = requestKey;
  service.listSavedReports = listSavedReports;
  service.openConfiguration = openConfiguration;
  service.requestPDF = requestPDF;
  service.deleteReport = deleteReport;

  function requestKey(key) {
    var url = '/reports/keys/';
    return $http.get(url.concat(key))
      .then(util.unwrapHttpResponse);
  }

  function listSavedReports(reportId) {
    var url = '/reports/saved/';
    return $http.get(url.concat(reportId))
      .then(util.unwrapHttpResponse);
  }

  /**
   * @function openConfiguration
   *
   * @description
   * This function uses a convention based template/ controller loading
   * standard to initialise a modal based on provided key.
   *
   * @param {Object} report   A detailed report object that should provide
   *                          id, key and title_key
   */
  function openConfiguration(report) {
    // modal is not opened through $stateProvider to allow dynamic controller
    // this should be updated if possible to allow deep linking

    // controller and template are linked by convention
    // template : /modules/reports/modals/:report_key:.modal.html
    // controller : :report_key:Controller
    var templateString = '/modules/reports/modals/'.concat(report.report_key, '.modal.html');
    var controllerString = report.report_key.concat('Controller as ReportConfigCtrl');

    return Modal.open({
      templateUrl : templateString,
      controller : controllerString,
      size : 'md',
      resolve : {
        reportDetails : function () {
          return report;
        }
      }
    });
  }

  /**
   * @function requestPDF
   *
   * @description
   * Formats a reports configuration options with the PDF report API and returns
   * a request for the PDF document generation.
   */
  function requestPDF(url, report, reportOptions) {
    var pdfParams = {
      // @TODO This should be known by the server
      reportId : report.id,
      saveReport : true,
      renderer : 'pdf'
    };

    var options = angular.merge(reportOptions, pdfParams);
    
    return $http.get(url, { params : options });
  }

  function deleteReport(uuid) {
    var url = '/reports/archive/'.concat(uuid);
    return $http.delete(url)
      .then(util.unwrapHttpResponse);
  }
}
