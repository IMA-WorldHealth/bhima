const FU = require('../../shared/FormUtils');
const ReportPage = require('../page');
const components = require('../../shared/components');

class CashflowReportPage {
  constructor(key) {
    this.page = new ReportPage(key);
  }

  // preview a Cashflow report
  async showCashflowReportPreview(cashboxes, dateFrom, dateTo) {
    await components.dateInterval.range(dateFrom, dateTo);
    await components.multipleCashBoxSelect.set(cashboxes);
    await this.page.preview();
  }

  // save a Cashflow report
  async saveCashflowReport(dateFrom, dateTo, cashboxes, reportName, reportFormat) {
    await this.showCashflowReportPreview(cashboxes, dateFrom, dateTo);

    // save report as PDF
    await this.page.saveAs();
    await FU.input('SaveCtrl.documentOptions.label', reportName);
    await FU.select('SaveCtrl.documentOptions.renderer', reportFormat);
    await FU.modal.submit();

    // successfully saved notification
    await components.notification.hasSuccess();
    await this.page.backToConfig();
  }

  // print the report
  async printCashflowReport(cashboxes, dateFrom, dateTo) {
    await this.showCashflowReportPreview(cashboxes, dateFrom, dateTo);
    await this.page.printPreview();
  }

  // check saved report
  async checkSavedCashflowReport(reportName) {
    await this.page.gotoArchive();
    await this.page.lastReportMatching(reportName);
    await this.page.backToConfig();
  }

  // close preview
  async closeCashflowReportPreview() {
    await this.page.closePreview();
  }
}

module.exports = CashflowReportPage;
