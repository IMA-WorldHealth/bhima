/* global browser, element, by */

const chai = require('chai');
const helpers = require('../../shared/helpers');

helpers.configure(chai);

const FU = require('../../shared/FormUtils');
const ReportPage = require('../page');
const components = require('../../shared/components');

class CreditorsReportPage {
  constructor(key) {
    this.page = new ReportPage(key);
  }

  // preview a Creditors report
  showCreditorsReportPreview(period, includeZero) {
    components.reportPeriodSelect.set(period);

    if (includeZero) {
      element(by.css('input[type="checkbox"]')).click();
    }
    
    this.page.preview();
  }

  // save a Creditors report
  saveCreditorsReport(period, includeZero, reportName, reportFormat) {
    this.showCreditorsReportPreview(period, includeZero);

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
  printCreditorsReport(period, includeZero) {
    this.showCreditorsReportPreview(period, includeZero);
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