const chai = require('chai');
const helpers = require('../../shared/helpers');

helpers.configure(chai);

const ReportCashflowPage = require('./cashflow.page');

describe('Cashflow Report', () => {
  let Page;
  const key = 'cashflow';

  const dataset = {
    cashboxes       : ['Caisse Auxiliaire'],
    dateFrom        : '01/01/2018',
    dateTo          : '31/12/2018',
    report_name     : 'Cashflow Report',
    renderer        : 'PDF',
    previousCashbox : [],
  };

  before(() => {
    helpers.navigate(`#!/reports/${key}`);
    Page = new ReportCashflowPage(key);
  });

  it('preview a new Cashflow Report', () => {
    Page.showCashflowReportPreview(dataset.cashboxes, dataset.dateFrom, dataset.dateTo);
  });

  it('close the previewed report', () => {
    Page.closeCashflowReportPreview();
  });

  it('save a previewed report', () => {
    Page.saveCashflowReport(
      dataset.dateFrom,
      dataset.dateTo,
      dataset.previousCashbox,
      dataset.report_name,
      dataset.renderer
    );
  });

  it('report has been saved into archive', () => {
    Page.checkSavedCashflowReport(dataset.report_name);
  });

  it('print the previewed report', () => {
    Page.printCashflowReport(dataset.cashboxes, dataset.dateFrom, dataset.dateTo);
  });
});
