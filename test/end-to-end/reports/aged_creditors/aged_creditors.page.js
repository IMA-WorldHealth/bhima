/* global element, by */

const FU = require('../../shared/FormUtils');
const ReportPage = require('../page');
const components = require('../../shared/components');

class CreditorsReportPage {
  constructor(key) {
    this.page = new ReportPage(key);
  }

  // preview a Creditors report
  async showCreditorsReportPreview(year, month, includeZero) {
    await components.fiscalYearSelect.set(year);
    await components.periodSelection.set(month);

    if (includeZero) {
      await element(by.css('input[type="checkbox"]')).click();
    }

    await this.page.preview();
  }

  // save a Creditors report
  async saveCreditorsReport(year, month, includeZero, reportName, reportFormat) {
    await this.showCreditorsReportPreview(year, month, includeZero);

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
  async printCreditorsReport(year, month, includeZero) {
    await this.showCreditorsReportPreview(year, month, includeZero);
    await this.page.printPreview();
  }

  // check saved report
  async checkSavedCreditorsReport(reportName) {
    await this.page.gotoArchive();
    await this.page.lastReportMatching(reportName);
    await this.page.backToConfig();
  }

  // close preview
  async closeCreditorsReportPreview() {
    await this.page.closePreview();
  }
}

module.exports = CreditorsReportPage;
