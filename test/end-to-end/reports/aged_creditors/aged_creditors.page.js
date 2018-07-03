/* global element, by */

const FU = require('../../shared/FormUtils');
const ReportPage = require('../page');
const components = require('../../shared/components');

class CreditorsReportPage {
  constructor(key) {
    this.page = new ReportPage(key);
  }

  // preview a Creditors report
  showCreditorsReportPreview(year, month, includeZero) {
    components.fiscalYearSelect.set(year);
    components.periodSelection.set(month);

    if (includeZero) {
      element(by.css('input[type="checkbox"]')).click();
    }

    this.page.preview();
  }

  // save a Creditors report
  saveCreditorsReport(year, month, includeZero, reportName, reportFormat) {
    this.showCreditorsReportPreview(year, month, includeZero);

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
  printCreditorsReport(year, month, includeZero) {
    this.showCreditorsReportPreview(year, month, includeZero);
    this.page.printPreview();
  }

  // check saved report
  checkSavedCreditorsReport(reportName) {
    this.page.gotoArchive();
    this.page.lastReportMatching(reportName);
    this.page.backToConfig();
  }

  // close preview
  closeCreditorsReportPreview() {
    this.page.closePreview();
  }
}

module.exports = CreditorsReportPage;
