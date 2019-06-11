angular.module('bhima.services')
  .service('CronEmailReportService', CronEmailReportService);

CronEmailReportService.$inject = ['PrototypeApiService'];

function CronEmailReportService(Api) {
  const service = new Api('/cron_email_reports/');
  return service;
}
