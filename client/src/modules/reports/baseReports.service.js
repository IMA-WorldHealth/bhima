angular.module('bhima.services')
  .service('BaseReportService', BaseReportService);

BaseReportService.$inject = ['$http', '$uibModal', 'util', 'LanguageService'];

function BaseReportService($http, Modal, util, Languages) {
  const service = this;

  service.requestKey = requestKey;
  service.listSavedReports = listSavedReports;
  service.deleteReport = deleteReport;

  service.saveReport = saveReport;
  service.requestPreview = requestPreview;
  service.saveAsModal = saveAsModal;
  service.emailReportModal = emailReportModal;
  service.emailReport = emailReport;

  function requestKey(key) {
    const url = '/reports/keys/';
    return $http.get(url.concat(key))
      .then(util.unwrapHttpResponse);
  }

  function listSavedReports(reportId) {
    const url = '/reports/saved/';
    return $http.get(url.concat(reportId))
      .then(util.unwrapHttpResponse);
  }

  function requestPreview(url, reportId, reportOptions) {
    const htmlParams = {
      reportId,
      saveReport : '0',
      renderer : 'html',
      lang : Languages.key,
    };

    const options = angular.merge(reportOptions, htmlParams);
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
    const params = {
      // @TODO This should be known by the server
      reportId : report.id,
      saveReport : '1',
    };
    const options = angular.merge(reportOptions, params);
    return $http.get(url, { params : options });
  }

  function deleteReport(uuid) {
    const url = '/reports/archive/'.concat(uuid);
    return $http.delete(url)
      .then(util.unwrapHttpResponse);
  }

  function emailReport(uuid, email) {
    const url = '/reports/archive/'.concat(uuid, '/email');
    return $http.post(url, { address : email })
      .then(util.unwrapHttpResponse);
  }

  function emailReportModal(options) {
    const instance = Modal.open({
      keyboard : true,
      resolve : {
        options : function resolveOptions() { return options; },
      },
      controller : 'EmailReportController as EmailCtrl',
      templateUrl : '/modules/reports/modals/reports.email.html',
    });

    return instance.result;
  }

  function saveAsModal(options) {
    const instance = Modal.open({
      animation : false,
      keyboard : true,
      size : 'md',
      resolve : {
        options : function resolveOptions() { return options; },
      },
      controller : 'SaveReportController as SaveCtrl',
      templateUrl : '/modules/reports/modals/report.save.html',
    });

    return instance.result;
  }
}
