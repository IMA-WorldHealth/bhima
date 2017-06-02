angular.module('bhima.services')
  .service('BaseReportService', BaseReportService);

BaseReportService.$inject = ['$http', '$uibModal', 'util'];

function BaseReportService($http, Modal, util) {
  var service = this;

  service.requestKey = requestKey;
  service.listSavedReports = listSavedReports;
  service.deleteReport = deleteReport;

  service.saveReport = saveReport;
  service.requestPreview = requestPreview;
  service.saveAsModal = saveAsModal;

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

  function requestPreview(url, reportId, reportOptions) {
    var htmlParams = {
      reportId : reportId,
      saveReport : '0',
      renderer : 'html',
    };

    var options = angular.merge(reportOptions, htmlParams);
    return $http.get(url, { params : options })
      .then(util.unwrapHttpResponse);
  }

  /**
   * @function requestPDF
   *
   * @description
   * Formats a reports configuration options with the PDF report API and returns
   * a request for the PDF document generation.
   */
  function saveReport(url, report, reportOptions) {
    var params = {
      // @TODO This should be known by the server
      reportId : report.id,
      saveReport : '1',
    };
    var options = angular.merge(reportOptions, params);

    return $http.get(url, { params : options });
  }

  function deleteReport(uuid) {
    var url = '/reports/archive/'.concat(uuid);
    return $http.delete(url)
      .then(util.unwrapHttpResponse);
  }

  function saveAsModal(options) {
    var instance = Modal.open({
      animation : false,
      keyboard : true,
      size : 'md',
      resolve : {
        options : function resolveOptions() { return options; },
      },
      controller : 'SaveReportController as SaveCtrl',
      templateUrl : '/modules/templates/modals/report.save.html',
    });

    return instance.result;
  }
}
