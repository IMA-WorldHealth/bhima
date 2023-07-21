const TU = require('../../shared/TestUtils');
const { by } = require('../../shared/TestUtils');
const components = require('../../shared/components');

const ReportPage = require('../page');

class StockExitReportPage {
  constructor(key) {
    this.page = new ReportPage(key);
  }

  // preview a StockExit report
  async showStockExitReportPreview(depotName, dateFrom, dateTo) {
    await components.depotSelect.set(depotName);
    await components.dateInterval.range(dateFrom, dateTo);

    await TU.locator(by.model('ReportConfigCtrl.includePatientExit')).check();
    await TU.locator(by.model('ReportConfigCtrl.includeServiceExit')).check();
    await TU.locator(by.model('ReportConfigCtrl.includeDepotExit')).check();
    await TU.locator(by.model('ReportConfigCtrl.includeLossExit')).check();

    return this.page.preview();
  }

  // save a StockExit report
  async saveStockExitReport(dateFrom, dateTo, depotName, reportName, reportFormat) {
    await this.showStockExitReportPreview(depotName, dateFrom, dateTo);

    // save report as PDF
    await this.page.saveAs();
    await TU.input('SaveCtrl.documentOptions.label', reportName);
    await TU.select('SaveCtrl.documentOptions.renderer', reportFormat);
    await TU.modal.submit();

    // successfully saved notification
    await components.notification.hasSuccess();
    return this.page.backToConfig();
  }

  // print the report
  async printStockExitReport(depotName, dateFrom, dateTo) {
    await this.showStockExitReportPreview(depotName, dateFrom, dateTo);
    return this.page.printPreview();
  }

  // check saved report
  async checkSavedStockExitReport(reportName) {
    await this.page.gotoArchive();
    await TU.waitForSelector('.ui-grid-canvas .ui-grid-row');
    await this.page.lastReportMatching(reportName);
    return this.page.backToConfig();
  }

  // close preview
  async closeStockExitReportPreview() {
    const btn = await TU.locator('[data-method="close"]');
    console.debug('B: ', btn, await btn.count());
    return this.page.closePreview();
  }
}

module.exports = StockExitReportPage;
