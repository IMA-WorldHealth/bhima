/* global browser, element, by */

const chai = require('chai');
const helpers = require('../../shared/helpers');

helpers.configure(chai);

const BalanceReportPage = require('./balance_report.page');

describe('Balance report ::', () => {
  let Page;
  const key = 'balance_report';

  const dataset = {
    dateFrom   : '01/01/2016',
    dateTo     : '31/12/2016',
    date       : new Date('2016-12-31 12:00'),
    dateOption : 0,
    classe     : '*',
    report_name : 'Balance Report Saved by E2E',
    renderer : 'PDF',
  };

  before(() => {
    helpers.navigate(`#!/reports/${key}`);
    Page = new BalanceReportPage(key);
  });

  it('preview a new balance report', () => {
    Page.showBalanceReportPreview(dataset.date);
  });

  it('close the previewed report', () => {
    Page.closeBalanceReportPreview();
  });

  it('save a previewed report', () => {
    Page.saveBalanceReport(dataset.date, dataset.report_name, dataset.renderer);
  });

  it('report has been saved into archive', () => {
    Page.checkSavedBalanceReport(dataset.report_name);
  });

  it('print the previewed report', () => {
    Page.printBalanceReport(dataset.date);
  });
});
