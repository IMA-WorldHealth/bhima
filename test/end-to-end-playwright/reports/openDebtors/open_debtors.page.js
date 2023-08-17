const TU = require('../../shared/TestUtils');
const { by } = require('../../shared/TestUtils');
const components = require('../../shared/components');

const ReportPage = require('../page');

class OpenDebtorsReportPage {
  constructor(key) {
    this.page = new ReportPage(key);
  }

  // preview a OpenDebtors report
  async showOpenDebtorsReportPreview(order) {
    const select = await TU.locator(by.model('ReportConfigCtrl.reportDetails.order'));
    await select.click();
    const option = await select.locator('.dropdown-menu [role="option"]').locator(by.containsText(order));
    await option.first().click(); // Select the first one arbitrarily for the test

    const showUnverifiedTransactions = await TU.locator('[name="showUnverifiedTransactions"]');
    const showDetailedView = await TU.locator('[name="showDetailedView"]');

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
    await TU.input('SaveCtrl.documentOptions.label', reportName);
    await TU.select('SaveCtrl.documentOptions.renderer', reportFormat);
    await TU.modal.submit();

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
    await TU.waitForSelector('.ui-grid-canvas .ui-grid-row');
    await this.page.lastReportMatching(reportName);
    await this.page.backToConfig();
  }

  // close preview
  async closeOpenDebtorsReportPreview() {
    await this.page.closePreview();
  }
}

module.exports = OpenDebtorsReportPage;
