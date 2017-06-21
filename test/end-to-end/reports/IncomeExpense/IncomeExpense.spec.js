/* global browser, element, by */

const chai = require('chai');
const helpers = require('../../shared/helpers');

helpers.configure(chai);

const ReportIncomeExpensePage = require('./income_expense.page');

describe.skip('Income Expense report ::', () => {
  let Page;
  const key = 'income_expense';

  const dataset = {
    fiscal_id : 2,
    periods : ['2016-01-01/2016-01-31', '2016-02-01/2016-02-29', '2016-03-01/2016-03-31'],
    type : 'Recettes et dépenses',
    report_name : 'Income Expense Report Saved by E2E',
    renderer : 'PDF',
    OnePeriod : ['2016-04-01/2016-04-30'],
    twoPeriods : ['2016-05-01/2016-05-31', '2016-06-01/2016-06-30'],
  };

  before(() => {
    helpers.navigate(`#!/reports/${key}`);
    Page = new ReportIncomeExpensePage(key);
    browser.refresh();
  });

  it('preview a new income expense report', () => {
    Page.showIncomeExpenseReportPreview(dataset.fiscal_id, dataset.periods, dataset.type);
  });

  it('close the previewed report', () => {
    Page.closeIncomeExpenseReportPreview();
  });

  it('save a previewed report', () => {
    Page.saveIncomeExpenseReport(dataset.fiscal_id, dataset.OnePeriod, dataset.type, dataset.report_name, dataset.renderer);
  });

  it('report has been saved into archive', () => {
    Page.checkSavedIncomeExpenseReport(dataset.report_name);
  });

  it('print the previewed report', () => {
    Page.printIncomeExpenseReport(dataset.fiscal_id, dataset.twoPeriods, dataset.type);
  });
});