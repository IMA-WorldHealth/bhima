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

  // preview an account report
  showDebtorsReportPreview(includeZero) {
    if (includeZero) {
      element(by.css('input[type="checkbox"]')).click();
    }
    
    this.page.preview();
  }

  // save an account report
  saveDebtorsReport(includeZero, reportName, reportFormat) {
    this.showDebtorsReportPreview();

    // save report as PDF
    this.page.saveAs();
    FU.input('SaveCtrl.documentOptions.label', reportName);
    FU.select('SaveCtrl.documentOptions.renderer', reportFormat);
    FU.modal.submit();

    // successfully saved notification
    components.notification.hasSuccess();
    this.page.backToConfig();
  }

  // print an debtors report
  printDebtorsReport(includeZero) {
    this.showDebtorsReportPreview(includeZero);
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
