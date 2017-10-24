/* global browser, element, by */

const chai = require('chai');
const helpers = require('../../shared/helpers');

helpers.configure(chai);

const FU = require('../../shared/FormUtils');
const ReportPage = require('../page');
const components = require('../../shared/components');

class CashflowByServiceReportPage {
  constructor(key) {
    this.page = new ReportPage(key);
  }

  // preview a CashflowByService report
  showCashflowByServiceReportPreview(dateRange, dateFrom, dateTo) {
    if(dateRange){
      $('[data-date-range="' + dateRange + '"]').click();
    } else {
      components.dateInterval.range(dateFrom, dateTo);
    }

    this.page.preview();
  }

  // save a CashflowByService report
  saveCashflowByServiceReport(dateRange, dateFrom, dateTo, reportName, reportFormat) {
    this.showCashflowByServiceReportPreview(dateRange, dateFrom, dateTo);

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
  printCashflowByServiceReport(dateRange, weekly, cashbox) {
    this.showCashflowByServiceReportPreview(dateRange, weekly, cashbox);
    this.page.printPreview();
  }

  // check saved report
  checkSavedCashflowByServiceReport(reportName) {
    this.page.gotoArchive();
    this.page.lastReportMatching(reportName);
    this.page.backToConfig();
  }

  // close preview
  closeCashflowByServiceReportPreview() {
    this.page.closePreview();
  }
}

module.exports = CashflowByServiceReportPage;