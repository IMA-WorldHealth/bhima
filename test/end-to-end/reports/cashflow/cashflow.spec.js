/* global browser, element, by */

const chai = require('chai');
const helpers = require('../../shared/helpers');

helpers.configure(chai);

const ReportCashflowPage = require('./cashflow.page');

describe('Cashflow Report ::', () => {
  let Page;
  const key = 'cashflow';

  const dataset = {
    date_range    : 'year',
    weekly1        : false,
    cashbox       : 'Test Aux Cashbox A $',
    dateFrom      : '01/01/2017',
    dateTo        : '01/04/2017',
    cashboxFc     : 'Test Aux Cashbox A Fc',
    report_name   : 'Cashflow Report',
    renderer      : 'PDF',
    weekly2       : true,
  };

  before(() => {
    helpers.navigate(`#!/reports/${key}`);
    Page = new ReportCashflowPage(key);
    browser.refresh();
  });

  it('preview a new Cashflow Report', () => {
    Page.showCashflowReportPreview(dataset.date_range, dataset.weekly1, dataset.cashbox);
  });

  it('close the previewed report', () => {
    Page.closeCashflowReportPreview();
  });

  it('save a previewed report', () => {
    Page.saveCashflowReport(dataset.dateFrom, dataset.dateTo, dataset.cashboxFc, dataset.report_name, dataset.renderer);
  });

  it('report has been saved into archive', () => {
    Page.checkSavedCashflowReport(dataset.report_name);
  });

  it('print the previewed report', () => {
    Page.printCashflowReport(dataset.date_range, dataset.weekly2, dataset.cashbox);
  });
});