/* global */

const chai = require('chai');
const helpers = require('../../shared/helpers');

helpers.configure(chai);

const FU = require('../../shared/FormUtils');
const ReportPage = require('../page');
const components = require('../../shared/components');

class CashflowReportPage {
  constructor(key) {
    this.page = new ReportPage(key);
  }

  // preview a Cashflow report
  showCashflowReportPreview(cashboxes, dateFrom, dateTo) {
    components.dateInterval.range(dateFrom, dateTo);
    components.multipleCashBoxSelect.set(cashboxes);
    this.page.preview();
  }

  // save a Cashflow report
  saveCashflowReport(dateFrom, dateTo, cashboxes, reportName, reportFormat) {
    this.showCashflowReportPreview(cashboxes, dateFrom, dateTo);

    // save report as PDF
    this.page.saveAs();
    FU.input('SaveCtrl.documentOptions.label', reportName);
    FU.select('SaveCtrl.documentOptions.renderer', reportFormat);
    FU.modal.submit();

    // successfully saved notification
    components.notification.hasSuccess();
    this.page.backToConfig();
  }

  // print the report
  printCashflowReport(cashboxes, dateFrom, dateTo) {
    this.showCashflowReportPreview(cashboxes, dateFrom, dateTo);
    this.page.printPreview();
  }

  // check saved report
  checkSavedCashflowReport(reportName) {
    this.page.gotoArchive();
    this.page.lastReportMatching(reportName);
    this.page.backToConfig();
  }

  // close preview
  closeCashflowReportPreview() {
    this.page.closePreview();
  }
}

module.exports = CashflowReportPage;
