/* global element, by */

const FU = require('../../shared/FormUtils');
const ReportPage = require('../page');
const components = require('../../shared/components');

class DebtorsReportPage {
  constructor(key) {
    this.page = new ReportPage(key);
  }

  // preview a Debtors report
  showDebtorsReportPreview(year, month, includeZero) {
    components.fiscalYearSelect.set(year);
    components.periodSelection.set(month);


    if (includeZero) {
      element(by.css('input[type="checkbox"]')).click();
    }

    this.page.preview();
  }

  // save a Debtors report
  saveDebtorsReport(year, month, includeZero, reportName, reportFormat) {
    this.showDebtorsReportPreview(year, month, includeZero);

    // save report as PDF
    this.page.saveAs();
    FU.input('SaveCtrl.documentOptions.label', reportName);
    FU.select('SaveCtrl.documentOptions.renderer', reportFormat);
    FU.modal.submit();

    // successfully saved notification
    components.notification.hasSuccess();
    this.page.backToConfig();
  }

  // print a debtors report
  printDebtorsReport(year, month, includeZero) {
    this.showDebtorsReportPreview(year, month, includeZero);
    this.page.printPreview();
  }

  // check saved report
  checkSavedDebtorsReport(reportName) {
    this.page.gotoArchive();
    this.page.lastReportMatching(reportName);
    this.page.backToConfig();
  }

  // close preview
  closeDebtorsReportPreview() {
    this.page.closePreview();
  }
}

module.exports = DebtorsReportPage;
