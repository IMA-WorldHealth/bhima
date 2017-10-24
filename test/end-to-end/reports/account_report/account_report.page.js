/* global browser, element, by */

const chai = require('chai');
const helpers = require('../../shared/helpers');

helpers.configure(chai);

const FU = require('../../shared/FormUtils');
const ReportPage = require('../page');
const components = require('../../shared/components');

class AccountReportPage {
  constructor(key) {
    this.page = new ReportPage(key);
  }

  // preview an account report
  showAccountReportPreview(account) {
    components.accountSelect.set(account);
    this.page.preview();
  }

  // save an account report
  saveAccountReport(account, reportName, reportFormat) {
    this.showAccountReportPreview(account);

    // save report as PDF
    this.page.saveAs();
    FU.input('SaveCtrl.documentOptions.label', reportName);
    FU.select('SaveCtrl.documentOptions.renderer', reportFormat);
    FU.modal.submit();

    // successfully saved notification
    components.notification.hasSuccess();
    this.page.backToConfig();
  }

  // print an account report
  printAccountReport(account) {
    this.showAccountReportPreview(account);
    this.page.printPreview();
  }

  // check saved report
  checkSavedAccountReport(reportName) {
    this.page.gotoArchive();
    this.page.lastReportMatching(reportName);
    this.page.backToConfig();
  }

  // close preview
  closeAccountReportPreview() {
    this.page.closePreview();
  }
}

module.exports = AccountReportPage;
