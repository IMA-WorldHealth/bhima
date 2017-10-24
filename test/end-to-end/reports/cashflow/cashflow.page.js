/* global browser, element, by */

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
  showCashflowReportPreview(dateRange, weekly, cashbox, dateFrom, dateTo) {
    if(dateRange){
      $('[data-date-range="' + dateRange + '"]').click();
    } else {
      components.dateInterval.range(dateFrom, dateTo);
    }

    if (weekly) {
      element(by.css('input[type="checkbox"]')).click();
    }

    components.cashboxSelect.set(cashbox);

    this.page.preview();
  }

  // save a Cashflow report
  saveCashflowReport(dateFrom, dateTo, cashbox, reportName, reportFormat) {
    this.showCashflowReportPreview(null, null, cashbox, dateFrom, dateTo);

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
  printCashflowReport(dateRange, weekly, cashbox) {
    this.showCashflowReportPreview(dateRange, weekly, cashbox);
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