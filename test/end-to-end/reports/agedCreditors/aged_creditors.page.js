const TU = require('../../shared/TestUtils');
const { by } = require('../../shared/TestUtils');

const components = require('../../shared/components');

const ReportPage = require('../page');

class CreditorsReportPage {
  constructor(key) {
    this.page = new ReportPage(key);
  }

  // preview a Creditors report
  async showCreditorsReportPreview(year, month, includeZero) {
    await components.fiscalYearSelect.set(year);
    await components.periodSelection.set(month);
    if (includeZero) {
      await TU.locator(by.model('ReportConfigCtrl.reportDetails.zeroes')).check();
    }
    return this.page.preview();
  }

  // save a Creditors report
  async saveCreditorsReport(year, month, includeZero, reportName, reportFormat) {
    await this.showCreditorsReportPreview(year, month, includeZero);

    // save report as PDF
    await this.page.saveAs();
    await TU.input('SaveCtrl.documentOptions.label', reportName);
    await TU.select('SaveCtrl.documentOptions.renderer', reportFormat);
    await TU.modal.submit();

    // successfully saved notification
    await components.notification.hasSuccess();
    return this.page.backToConfig();
  }

  // print a debtors report
  async printCreditorsReport(year, month, includeZero) {
    await this.showCreditorsReportPreview(year, month, includeZero);
    return this.page.printPreview();
  }

  // check saved report
  async checkSavedCreditorsReport(reportName) {
    await this.page.gotoArchive();
    await TU.waitForSelector('.ui-grid-canvas .ui-grid-row');
    await this.page.lastReportMatching(reportName);
    return this.page.backToConfig();
  }

  // close preview
  async closeCreditorsReportPreview() {
    return this.page.closePreview();
  }
}

module.exports = CreditorsReportPage;
