/* global browser, element, by */

const chai = require('chai');
const helpers = require('../../shared/helpers');

helpers.configure(chai);

const FU = require('../../shared/FormUtils');
const ReportPage = require('../page');
const components = require('../../shared/components');

class BalanceReportPage {
  constructor(key) {
    this.page = new ReportPage(key);
    browser.refresh();
  }

  // preview an account report
  showBalanceReportPreview(classe, dateOption, dateFrom, dateTo) {
    FU.uiSelect('ReportConfigCtrl.classe', classe);
    FU.radio('ReportConfigCtrl.dateOption', dateOption);
    components.dateInterval.range(dateFrom, dateTo);
    this.page.preview();
  }

  // save an account report
  saveBalanceReport(classe, dateOption, dateFrom, dateTo, reportName, reportFormat) {
    this.showBalanceReportPreview(classe, dateOption, dateFrom, dateTo);

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
  printBalanceReport(classe, dateOption, dateFrom, dateTo) {
    this.showBalanceReportPreview(classe, dateOption, dateFrom, dateTo);
    this.page.printPreview();
  }

  // check saved report
  checkSavedBalanceReport(reportName) {
    this.page.gotoArchive();
    this.page.lastReportMatching(reportName);
    this.page.backToConfig();
  }

  // close preview
  closeBalanceReportPreview() {
    this.page.closePreview();
  }
}

module.exports = BalanceReportPage;
