const FU = require('../../shared/FormUtils');
const ReportPage = require('../page');
const components = require('../../shared/components');

class BalanceReportPage {
  constructor(key) {
    this.page = new ReportPage(key);
  }

  // preview an account report
  showBalanceReportPreview(period) {
    components.reportPeriodSelect.set(period);
    components.yesNoRadios.set('yes', 'useSeparateDebitsAndCredits');
    components.yesNoRadios.set('yes', 'shouldPruneEmptyRows');
    this.page.preview();
  }

  // save an account report
  saveBalanceReport(period, reportName, reportFormat) {
    this.showBalanceReportPreview(period);

    // save report as PDF
    this.page.saveAs();
    FU.input('SaveCtrl.documentOptions.label', reportName);
    FU.select('SaveCtrl.documentOptions.renderer', reportFormat);
    FU.modal.submit();

    // successfully saved notification
    components.notification.hasSuccess();
    this.page.backToConfig();
  }

  // print an account report
  printBalanceReport(date) {
    this.showBalanceReportPreview(date);
    this.page.printPreview();
  }

  // check saved report
  checkSavedBalanceReport(reportName) {
    this.page.gotoArchive();
    this.page.lastReportMatching(reportName);
    this.page.backToConfig();
  }

  // close preview
  closeBalanceReportPreview() {
    this.page.closePreview();
  }
}

module.exports = BalanceReportPage;
