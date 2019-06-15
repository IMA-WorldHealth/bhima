const FU = require('../../shared/FormUtils');
const ReportPage = require('../page');
const components = require('../../shared/components');

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
    await FU.input('SaveCtrl.documentOptions.label', reportName);
    await FU.select('SaveCtrl.documentOptions.renderer', reportFormat);
    await FU.modal.submit();

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
    await this.page.lastReportMatching(reportName);
    await this.page.backToConfig();
  }

  // close preview
  async closeAnnualClientsReportPreview() {
    await this.page.closePreview();
  }
}

module.exports = AnnualClientsReportPage;
