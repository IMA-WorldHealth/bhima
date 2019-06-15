const helpers = require('../../shared/helpers');
const ReportIncomeExpensePage = require('./income_expense.page');

describe.skip('Income Expense Report', () => {
  let page;
  const key = 'income_expense';

  const dataset = {
    fiscal_id : 2,
    periodFrom_id : 201602,
    periodTo_id : 201607,
    type : 'Recettes et dépenses',
    report_name : 'Income Expense Report Saved by E2E',
    renderer : 'PDF',
  };

  before(async () => {
    await helpers.navigate(`#!/reports/${key}`);
    page = new ReportIncomeExpensePage(key);
  });

  it('preview a new income expense report', async () => {
    await page.showIncomeExpenseReportPreview(
      dataset.fiscal_id, dataset.periodFrom_id, dataset.periodTo_id, dataset.type
    );
  });

  it('close the previewed report', async () => {
    await page.closeIncomeExpenseReportPreview();
  });

  it('save a previewed report', async () => {
    await page.saveIncomeExpenseReport(
      dataset.fiscal_id,
      dataset.periodFrom_id,
      dataset.periodTo_id,
      dataset.type,
      dataset.report_name,
      dataset.renderer
    );
  });

  it('report has been saved into archive', async () => {
    await page.checkSavedIncomeExpenseReport(dataset.report_name);
  });

  it('print the previewed report', async () => {
    await page.printIncomeExpenseReport(dataset.fiscal_id, dataset.periodFrom_id, dataset.periodTo_id, dataset.type);
  });
});
