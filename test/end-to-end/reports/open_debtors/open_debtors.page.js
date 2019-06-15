/* global element, by */
const FU = require('../../shared/FormUtils');
const ReportPage = require('../page');
const components = require('../../shared/components');

class OpenDebtorsReportPage {
  constructor(key) {
    this.page = new ReportPage(key);
  }

  // preview a OpenDebtors report
  async showOpenDebtorsReportPreview(order) {
    const select = element(by.model('ReportConfigCtrl.reportDetails.order'));
    await select.click();
    const option = select.element(by.cssContainingText('.dropdown-menu [role="option"]', order));
    await option.click();

    const showUnverifiedTransactions = $('[name="showUnverifiedTransactions"]');
    const showDetailedView = $('[name="showDetailedView"]');

    // enable the checkboxes
    await showUnverifiedTransactions.click();
    await showDetailedView.click();

    await this.page.preview();
  }

  // save a OpenDebtors report
  async saveOpenDebtorsReport(order, reportName, reportFormat) {
    await this.showOpenDebtorsReportPreview(order);

    // save report as PDF
    await this.page.saveAs();
    await FU.input('SaveCtrl.documentOptions.label', reportName);
    await FU.select('SaveCtrl.documentOptions.renderer', reportFormat);
    await FU.modal.submit();

    // successfully saved notification
    await components.notification.hasSuccess();
    await this.page.backToConfig();
  }

  // print a debtors report
  async printOpenDebtorsReport(order) {
    await this.showOpenDebtorsReportPreview(order);
    await this.page.printPreview();
  }

  // check saved report
  async checkSavedOpenDebtorsReport(reportName) {
    await this.page.gotoArchive();
    await this.page.lastReportMatching(reportName);
    await this.page.backToConfig();
  }

  // close preview
  async closeOpenDebtorsReportPreview() {
    await this.page.closePreview();
  }
}

module.exports = OpenDebtorsReportPage;
