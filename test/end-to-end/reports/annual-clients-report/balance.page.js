const FU = require('../../shared/FormUtils');
const ReportPage = require('../page');
const components = require('../../shared/components');

class AnnualClientsReportPage {
  constructor(key) {
    this.page = new ReportPage(key);
  }

  // preview an income expense report
  showAnnualClientsReportPreview(fiscalYear) {
    components.fiscalYearSelect.set(fiscalYear);
    this.page.preview();
  }

  // save an income expense report
  saveAnnualClientsReport(fiscalYear, reportName, reportFormat) {
    this.showAnnualClientsReportPreview(fiscalYear);

    // save report as PDF
    this.page.saveAs();
    FU.input('SaveCtrl.documentOptions.label', reportName);
    FU.select('SaveCtrl.documentOptions.renderer', reportFormat);
    FU.modal.submit();

    // successfully saved notification
    components.notification.hasSuccess();
    this.page.backToConfig();
  }

  // print an income expense report
  printAnnualClientsReport(fiscalYear) {
    this.showAnnualClientsReportPreview(fiscalYear);
    this.page.printPreview();
  }

  // check saved report
  checkSavedAnnualClientsReport(reportName) {
    this.page.gotoArchive();
    this.page.lastReportMatching(reportName);
    this.page.backToConfig();
  }

  // close preview
  closeAnnualClientsReportPreview() {
    this.page.closePreview();
  }
}

module.exports = AnnualClientsReportPage;
