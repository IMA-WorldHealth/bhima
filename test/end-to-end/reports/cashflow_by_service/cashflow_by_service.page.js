const FU = require('../../shared/FormUtils');
const ReportPage = require('../page');
const components = require('../../shared/components');

class CashflowByServiceReportPage {
  constructor(key) {
    this.page = new ReportPage(key);
  }

  // preview a CashflowByService report
  async showCashflowByServiceReportPreview(dateRange, dateFrom, dateTo, cashbox) {
    if (dateRange) {
      await $(`[data-date-range="${dateRange}"]`).click();
    } else {
      await components.dateInterval.range(dateFrom, dateTo);
    }

    await components.cashboxSelect.set(cashbox);

    await this.page.preview();
  }

  // save a CashflowByService report
  async saveCashflowByServiceReport(dateRange, dateFrom, dateTo, cashbox, reportName, reportFormat) {
    await this.showCashflowByServiceReportPreview(dateRange, dateFrom, dateTo, cashbox);

    // save report as PDF
    await this.page.saveAs();
    await FU.input('SaveCtrl.documentOptions.label', reportName);
    await FU.select('SaveCtrl.documentOptions.renderer', reportFormat);
    await FU.modal.submit();

    // successfully saved notification
    await components.notification.hasSuccess();
    await this.page.backToConfig();
  }

  async printCashflowByServiceReport(dateRange, dateFrom, dateTo, cashbox) {
    await this.showCashflowByServiceReportPreview(dateRange, dateFrom, dateTo, cashbox);
    await this.page.printPreview();
  }

  // check saved report
  async checkSavedCashflowByServiceReport(reportName) {
    await this.page.gotoArchive();
    await this.page.lastReportMatching(reportName);
    await this.page.backToConfig();
  }

  // close preview
  async closeCashflowByServiceReportPreview() {
    await this.page.closePreview();
  }
}

module.exports = CashflowByServiceReportPage;
