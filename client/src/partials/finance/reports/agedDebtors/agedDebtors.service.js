angular.module('bhima.services')
  .service('AgedDebtorReportService', AgedDebtorReportService);

AgedDebtorReportService.$inject = [ 'PrototypeApiService', 'bhConstants' ];

function AgedDebtorReportService(Api, bhConstants) {
  var service = new Api('/finance/reports/debtors/aged');

  // bind the report type to the service
  service.REPORT_TYPE = bhConstants.reports.AGED_DEBTOR;

  return service;
}
