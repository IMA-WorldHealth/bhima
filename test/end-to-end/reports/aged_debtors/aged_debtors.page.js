/* global element, by */

const FU = require('../../shared/FormUtils');
const ReportPage = require('../page');
const components = require('../../shared/components');

class DebtorsReportPage {
  constructor(key) {
    this.page = new ReportPage(key);
  }

  // preview a Debtors report
  async showDebtorsReportPreview(year, month, includeZero, currencyId) {
    await components.fiscalYearSelect.set(year);
    await components.periodSelection.set(month);
    await components.currencySelect.set(currencyId);

    if (includeZero) {
      await element(by.css('input[type="checkbox"]')).click();
    }

    await this.page.preview();
  }

  // save a Debtors report
  async saveDebtorsReport(year, month, includeZero, reportName, reportFormat, currencyId) {
    await this.showDebtorsReportPreview(year, month, includeZero, currencyId);

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
  async printDebtorsReport(year, month, includeZero, currencyId) {
    await this.showDebtorsReportPreview(year, month, includeZero, currencyId);
    await this.page.printPreview();
  }

  // check saved report
  async checkSavedDebtorsReport(reportName) {
    await this.page.gotoArchive();
    await this.page.lastReportMatching(reportName);
    await this.page.backToConfig();
  }

  // close preview
  async closeDebtorsReportPreview() {
    await this.page.closePreview();
  }
}

module.exports = DebtorsReportPage;
