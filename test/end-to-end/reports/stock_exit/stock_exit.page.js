/* global element, by */

const FU = require('../../shared/FormUtils');
const ReportPage = require('../page');
const components = require('../../shared/components');

class StockExitReportPage {
  constructor(key) {
    this.page = new ReportPage(key);
  }

  // preview a StockExit report
  showStockExitReportPreview(depotName, dateFrom, dateTo) {
    components.depotSelect.set(depotName);
    components.dateInterval.range(dateFrom, dateTo);

    element(by.model('ReportConfigCtrl.includePatientExit')).click();
    element(by.model('ReportConfigCtrl.includeServiceExit')).click();
    element(by.model('ReportConfigCtrl.includeDepotExit')).click();
    element(by.model('ReportConfigCtrl.includeLossExit')).click();

    this.page.preview();
  }

  // save a StockExit report
  saveStockExitReport(dateFrom, dateTo, depotName, reportName, reportFormat) {
    this.showStockExitReportPreview(depotName, dateFrom, dateTo);

    // save report as PDF
    this.page.saveAs();
    FU.input('SaveCtrl.documentOptions.label', reportName);
    FU.select('SaveCtrl.documentOptions.renderer', reportFormat);
    FU.modal.submit();

    // successfully saved notification
    components.notification.hasSuccess();
    this.page.backToConfig();
  }

  // print the report
  printStockExitReport(depotName, dateFrom, dateTo) {
    this.showStockExitReportPreview(depotName, dateFrom, dateTo);
    this.page.printPreview();
  }

  // check saved report
  checkSavedStockExitReport(reportName) {
    this.page.gotoArchive();
    this.page.lastReportMatching(reportName);
    this.page.backToConfig();
  }

  // close preview
  closeStockExitReportPreview() {
    this.page.closePreview();
  }
}

module.exports = StockExitReportPage;
