const FU = require('../../shared/FormUtils');
const ReportPage = require('../page');
const components = require('../../shared/components');

class DebtorClientAccountBalanceReportPage {
  constructor(key) {
    this.page = new ReportPage(key);
  }

  // preview an income expense report
  showDebtorAccountBalanceReportPreview(fiscalYear) {
    components.fiscalYearSelect.set(fiscalYear);
    this.page.preview();
  }

  // save an income expense report
  saveDebtorAccountBalanceReport(fiscalYear, reportName, reportFormat) {
    this.showDebtorAccountBalanceReportPreview(fiscalYear);

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
  printDebtorAccountBalanceReport(fiscalYear) {
    this.showDebtorAccountBalanceReportPreview(fiscalYear);
    this.page.printPreview();
  }

  // check saved report
  checkSavedDebtorAccountBalanceReport(reportName) {
    this.page.gotoArchive();
    this.page.lastReportMatching(reportName);
    this.page.backToConfig();
  }

  // close preview
  closeDebtorAccountBalanceReportPreview() {
    this.page.closePreview();
  }
}

module.exports = DebtorClientAccountBalanceReportPage;
