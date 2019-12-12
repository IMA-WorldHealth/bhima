/* global element, by */

const FU = require('../../shared/FormUtils');
const ReportPage = require('../page');
const components = require('../../shared/components');

class StockExitReportPage {
  constructor(key) {
    this.page = new ReportPage(key);
  }

  // preview a StockExit report
  async showStockExitReportPreview(depotName, dateFrom, dateTo) {
    await components.depotSelect.set(depotName);
    await components.dateInterval.range(dateFrom, dateTo);

    await element(by.model('ReportConfigCtrl.includePatientExit')).click();
    await element(by.model('ReportConfigCtrl.includeServiceExit')).click();
    await element(by.model('ReportConfigCtrl.includeDepotExit')).click();
    await element(by.model('ReportConfigCtrl.includeLossExit')).click();

    await this.page.preview();
  }

  // save a StockExit report
  async saveStockExitReport(dateFrom, dateTo, depotName, reportName, reportFormat) {
    await this.showStockExitReportPreview(depotName, dateFrom, dateTo);

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
  async printStockExitReport(depotName, dateFrom, dateTo) {
    await this.showStockExitReportPreview(depotName, dateFrom, dateTo);
    await this.page.printPreview();
  }

  // check saved report
  async checkSavedStockExitReport(reportName) {
    await this.page.gotoArchive();
    await this.page.lastReportMatching(reportName);
    await this.page.backToConfig();
  }

  // close preview
  async closeStockExitReportPreview() {
    await this.page.closePreview();
  }
}

module.exports = StockExitReportPage;
