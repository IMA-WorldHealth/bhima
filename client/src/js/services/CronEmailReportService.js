angular.module('bhima.services')
  .service('CronEmailReportService', CronEmailReportService);

CronEmailReportService.$inject = ['PrototypeApiService'];

function CronEmailReportService(Api) {
  const service = new Api('/cron_email_reports/');

  service.send = send;

  function send(id) {
    return service.$http.post(`/cron_email_reports/${id}`)
      .then(service.util.unwrapHttpResponse);
  }

  return service;
}
