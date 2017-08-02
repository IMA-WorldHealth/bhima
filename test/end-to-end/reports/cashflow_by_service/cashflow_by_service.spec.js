/* global browser, element, by */

const chai = require('chai');
const helpers = require('../../shared/helpers');

helpers.configure(chai);

const ReportCashflowPage = require('./cashflow_by_service.page');

describe('Cashflow By Service Report ::', () => {
  let Page;
  const key = 'cashflowByService';

  const dataset = {
    date_range    : 'year',
    date_range2   : 'month',
    dateFrom      : '01/01/2017',
    dateTo        : '01/04/2017',
    report_name   : 'Cashflow Report',
    renderer      : 'PDF',
  };

  before(() => {
    helpers.navigate(`#!/reports/${key}`);
    Page = new ReportCashflowPage(key);
    browser.refresh();
  });

  it('preview a new Cashflow By Service Report', () => {
    Page.showCashflowByServiceReportPreview(dataset.date_range);
  });

  it('close the previewed report', () => {
    Page.closeCashflowByServiceReportPreview();
  });

  it('save a previewed report', () => {
    Page.saveCashflowByServiceReport(null, dataset.dateFrom, dataset.dateTo, dataset.report_name, dataset.renderer);
  });

  it('report has been saved into archive', () => {
    Page.checkSavedCashflowByServiceReport(dataset.report_name);
  });

  it('print the previewed report', () => {
    Page.printCashflowByServiceReport(dataset.date_range2);
  });
});