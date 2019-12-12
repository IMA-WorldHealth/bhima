const FU = require('../../shared/FormUtils');
const ReportPage = require('../page');
const components = require('../../shared/components');

class AccountReportPage {
  constructor(key) {
    this.page = new ReportPage(key);
  }

  // preview an account report
  async showAccountReportPreview(account) {
    await components.accountSelect.set(account);
    await this.page.preview();
  }

  // save an account report
  async saveAccountReport(account, reportName, reportFormat) {
    await this.showAccountReportPreview(account);

    // save report as PDF
    await this.page.saveAs();
    await FU.input('SaveCtrl.documentOptions.label', reportName);
    await FU.select('SaveCtrl.documentOptions.renderer', reportFormat);
    await FU.modal.submit();

    // successfully saved notification
    await components.notification.hasSuccess();
    await this.page.backToConfig();
  }

  // print an account report
  async printAccountReport(account) {
    await this.showAccountReportPreview(account);
    await this.page.printPreview();
  }

  // check saved report
  async checkSavedAccountReport(reportName) {
    await this.page.gotoArchive();
    await this.page.lastReportMatching(reportName);
    await this.page.backToConfig();
  }

  // close preview
  async closeAccountReportPreview() {
    await this.page.closePreview();
  }
}

module.exports = AccountReportPage;
