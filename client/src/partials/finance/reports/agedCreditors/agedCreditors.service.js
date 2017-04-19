angular.module('bhima.services')
  .service('AgedCreditorReportService', AgedCreditorReportService);

AgedCreditorReportService.$inject = [ 'PrototypeApiService', 'bhConstants' ];

function AgedCreditorReportService(Api, bhConstants) {
  var service = new Api('/finance/reports/creditors/aged');

  // bind the report type to the service
  service.REPORT_TYPE = bhConstants.reports.AGED_DEBTOR;

  return service;
}
