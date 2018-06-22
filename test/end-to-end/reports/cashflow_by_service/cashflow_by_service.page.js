const FU = require('../../shared/FormUtils');
const ReportPage = require('../page');
const components = require('../../shared/components');

class CashflowByServiceReportPage {
  constructor(key) {
    this.page = new ReportPage(key);
  }

  // preview a CashflowByService report
  showCashflowByServiceReportPreview(dateRange, dateFrom, dateTo, cashbox) {
    if (dateRange) {
      $(`[data-date-range="${dateRange}"]`).click();
    } else {
      components.dateInterval.range(dateFrom, dateTo);
    }

    components.cashboxSelect.set(cashbox);

    this.page.preview();
  }

  // save a CashflowByService report
  saveCashflowByServiceReport(dateRange, dateFrom, dateTo, cashbox, reportName, reportFormat) {
    this.showCashflowByServiceReportPreview(dateRange, dateFrom, dateTo, cashbox);

    // save report as PDF
    this.page.saveAs();
    FU.input('SaveCtrl.documentOptions.label', reportName);
    FU.select('SaveCtrl.documentOptions.renderer', reportFormat);
    FU.modal.submit();

    // successfully saved notification
    components.notification.hasSuccess();
    this.page.backToConfig();
  }

  printCashflowByServiceReport(dateRange, dateFrom, dateTo, cashbox) {
    this.showCashflowByServiceReportPreview(dateRange, dateFrom, dateTo, cashbox);
    this.page.printPreview();
  }

  // check saved report
  checkSavedCashflowByServiceReport(reportName) {
    this.page.gotoArchive();
    this.page.lastReportMatching(reportName);
    this.page.backToConfig();
  }

  // close preview
  closeCashflowByServiceReportPreview() {
    this.page.closePreview();
  }
}

module.exports = CashflowByServiceReportPage;
