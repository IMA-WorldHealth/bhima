/* global browser, element, by */

const chai = require('chai');
const helpers = require('../../shared/helpers');

helpers.configure(chai);

const FU = require('../../shared/FormUtils');
const ReportPage = require('../page');
const components = require('../../shared/components');

class DebtorsReportPage {
  constructor(key) {
    this.page = new ReportPage(key);
  }

  // preview a Debtors report
  showDebtorsReportPreview(period, includeZero) {
    components.reportPeriodSelect.set(period);

    if (includeZero) {
      element(by.css('input[type="checkbox"]')).click();
    }
    
    this.page.preview();
  }

  // save a Debtors report
  saveDebtorsReport(period, includeZero, reportName, reportFormat) {
    this.showDebtorsReportPreview(period, includeZero);

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
  printDebtorsReport(period, includeZero) {
    this.showDebtorsReportPreview(period, includeZero);
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