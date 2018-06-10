const FU = require('../../shared/FormUtils');
const ReportPage = require('../page');
const components = require('../../shared/components');

class BalanceReportPage {
  constructor(key) {
    this.page = new ReportPage(key);
  }

  // preview an account report
  showBalanceReportPreview(year, month) {
    components.fiscalYearSelect.set(year);
    components.periodSelection.set(month);
    components.yesNoRadios.set('yes', 'useSeparateDebitsAndCredits');
    components.yesNoRadios.set('yes', 'shouldPruneEmptyRows');
    components.yesNoRadios.set('yes', 'shouldHideTitleAccounts');
    this.page.preview();
  }

  // save an account report
  saveBalanceReport(year, month, reportName, reportFormat) {
    this.showBalanceReportPreview(year, month);

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
  printBalanceReport(year, month) {
    this.showBalanceReportPreview(year, month);
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
