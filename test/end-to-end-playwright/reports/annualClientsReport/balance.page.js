const TU = require('../../shared/TestUtils');
const components = require('../../shared/components');
const ReportPage = require('../page');

class AnnualClientsReportPage {
  constructor(key) {
    this.page = new ReportPage(key);
  }

  // preview an income expense report
  async showAnnualClientsReportPreview(fiscalYear) {
    await components.fiscalYearSelect.set(fiscalYear);
    this.page.preview();
  }

  // save an income expense report
  async saveAnnualClientsReport(fiscalYear, reportName, reportFormat) {
    await this.showAnnualClientsReportPreview(fiscalYear);

    // save report as PDF
    await this.page.saveAs();
    await TU.input('SaveCtrl.documentOptions.label', reportName);
    await TU.select('SaveCtrl.documentOptions.renderer', reportFormat);
    await TU.modal.submit();

    // successfully saved notification
    await components.notification.hasSuccess();
    await this.page.backToConfig();
  }

  // print an income expense report
  async printAnnualClientsReport(fiscalYear) {
    await this.showAnnualClientsReportPreview(fiscalYear);
    await this.page.printPreview();
  }

  // check saved report
  async checkSavedAnnualClientsReport(reportName) {
    await this.page.gotoArchive();
    await TU.waitForSelector('.ui-grid-canvas .ui-grid-row');
    await this.page.lastReportMatching(reportName);
    await this.page.backToConfig();
  }

  // close preview
  async closeAnnualClientsReportPreview() {
    await this.page.closePreview();
  }
}

module.exports = AnnualClientsReportPage;
