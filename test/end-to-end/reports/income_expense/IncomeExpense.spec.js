/* global browser, element, by */

const chai = require('chai');
const helpers = require('../../shared/helpers');

helpers.configure(chai);

const ReportIncomeExpensePage = require('./income_expense.page');

describe('Income Expense report ::', () => {
  let Page;
  const key = 'income_expense';

  const dataset = {
    fiscal_id : 2,
    periodFrom_id : 201602,
    periodTo_id : 201607,
    type : 'Recettes et dépenses',
    report_name : 'Income Expense Report Saved by E2E',
    renderer : 'PDF',
  };

  before(() => {
    helpers.navigate(`#!/reports/${key}`);
    Page = new ReportIncomeExpensePage(key);
    browser.refresh();
  });

  it('preview a new income expense report', () => {
    Page.showIncomeExpenseReportPreview(dataset.fiscal_id, dataset.periodFrom_id, dataset.periodTo_id, dataset.type);
  });

  it('close the previewed report', () => {
    Page.closeIncomeExpenseReportPreview();
  });

  it('save a previewed report', () => {
    Page.saveIncomeExpenseReport(dataset.fiscal_id, dataset.periodFrom_id, dataset.periodTo_id, dataset.type, dataset.report_name, dataset.renderer);
  });

  it('report has been saved into archive', () => {
    Page.checkSavedIncomeExpenseReport(dataset.report_name);
  });

  it('print the previewed report', () => {
    Page.printIncomeExpenseReport(dataset.fiscal_id, dataset.periodFrom_id, dataset.periodTo_id, dataset.type);
  });
});
