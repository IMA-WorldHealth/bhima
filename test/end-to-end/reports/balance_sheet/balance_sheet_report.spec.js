const chai = require('chai');
const helpers = require('../../shared/helpers');

helpers.configure(chai);

const ReportBalanceSheetPage = require('./balance_sheet_report.page');

describe('Balance Sheet Report', () => {
  let Page;
  const key = 'balance_sheet_report';

  const dataset = {
    fiscal : 'Test Fiscal Year 2017',
    periodFrom : 'janvier 2017',
    periodTo : 'décembre 2017',
    type : 'Recettes et dépenses',
    showExploitation : false,
    report_name : 'Report Saved by E2E',
    renderer : 'PDF',
  };


  before(() => {
    helpers.navigate(`#!/reports/${key}`);
    Page = new ReportBalanceSheetPage(key);
  });

  it('preview a new balanceSheet report', () => {
    Page.showBalanceSheetReportPreview(dataset.fiscal, dataset.periodFrom, dataset.periodTo, dataset.type);
  });

  it('close the previewed report', () => {
    Page.closeBalanceSheetReportPreview();
  });

  it('save a previewed report', () => {
    Page.saveBalanceSheetReport(
      dataset.fiscal,
      dataset.periodFrom,
      dataset.periodTo,
      dataset.type,
      dataset.report_name,
      dataset.renderer
    );
  });

  it('report has been saved into archive', () => {
    Page.checkSavedBalanceSheetReport(dataset.report_name);
  });

  it('print the previewed report', () => {
    Page.printBalanceSheetReport(dataset.fiscal, dataset.periodFrom, dataset.periodTo);
  });
});
