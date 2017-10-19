/* global browser, element, by */

const chai = require('chai');
const helpers = require('../../shared/helpers');

helpers.configure(chai);

const FU = require('../../shared/FormUtils');
const ReportPage = require('../page');
const components = require('../../shared/components');

class DebtorClientAccountBalanceReportPage {
  constructor(key) {
    this.page = new ReportPage(key);
  }

  // preview an income expense report
  showIncomeExpenseReportPreview(fiscalYearId) {
    components.fiscalYearSelect.set(fiscalYearId);
    this.page.preview();
  }

  // save an income expense report
  saveIncomeExpenseReport(fiscalYearId, reportName, reportFormat) {
    this.showIncomeExpenseReportPreview(fiscalYearId);

    // save report as PDF
    this.page.saveAs();
    FU.input('SaveCtrl.documentOptions.label', reportName);
    FU.select('SaveCtrl.documentOptions.renderer', reportFormat);
    FU.modal.submit();

    // successfully saved notification
    components.notification.hasSuccess();
    this.page.backToConfig();
  }

  // print an income expense report
  printIncomeExpenseReport(fiscalYearId) {
    this.showIncomeExpenseReportPreview(fiscalYearId);
    this.page.printPreview();
  }

  // check saved report
  checkSavedIncomeExpenseReport(reportName) {
    this.page.gotoArchive();
    this.page.lastReportMatching(reportName);
    this.page.backToConfig();
  }

  // close preview
  closeIncomeExpenseReportPreview() {
    this.page.closePreview();
  }
}

module.exports = DebtorClientAccountBalanceReportPage;
