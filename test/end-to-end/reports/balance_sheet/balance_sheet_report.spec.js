/* global browser, element, by */

const chai = require('chai');
const helpers = require('../../shared/helpers');

helpers.configure(chai);

const ReportBalanceSheetPage = require('./balance_sheet_report.page');

describe('BalanceSheets report ::', () => {
  let Page;
  const key = 'balance_sheet_report';

  const dataset = {
    date : new Date(),
    showExploitation : false,
    report_name : 'Report Saved by E2E',
    renderer : 'PDF',
  };

  before(() => {
    helpers.navigate(`#!/reports/${key}`);
    Page = new ReportBalanceSheetPage(key);
    browser.refresh();    
  });

  it('preview a new balanceSheet report', () => {
    Page.showBalanceSheetReportPreview(dataset.date);
  });

  it('close the previewed report', () => {
    Page.closeBalanceSheetReportPreview();
  });

  it('save a previewed report', () => {
    Page.saveBalanceSheetReport(dataset.date, dataset.showExploitation, dataset.report_name, dataset.renderer);
  });

  it('report has been saved into archive', () => {
    Page.checkSavedBalanceSheetReport(dataset.report_name);
  });

  it('print the previewed report', () => {
    Page.printBalanceSheetReport(dataset.date);
  });
});
