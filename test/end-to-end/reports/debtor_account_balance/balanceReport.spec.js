/* global browser, element, by */

const chai = require('chai');
const helpers = require('../../shared/helpers');

helpers.configure(chai);

const DebtorClientAccountBalanceReportPage = require('./balance.page');

describe('Debtor Clients Account Balance Report', () => {
  let Page;
  const key = 'debtorBalanceReport';

  const dataset = {
    fiscal_id : 2,
    type : 'Accounts balance',
    report_name : 'debtor client accounts balance Saved by E2E',
    renderer : 'PDF',
  };

  before(() => {
    helpers.navigate(`#!/reports/${key}`);
    Page = new DebtorClientAccountBalanceReportPage(key);
    browser.refresh();
  });

  it('preview a new Debtor client account balance report', () => {
    Page.showIncomeExpenseReportPreview(dataset.fiscal_id);
  });

  it('close the previewed report', () => {
    Page.closeIncomeExpenseReportPreview();
  });

  it('save a previewed report', () => {
    Page.saveIncomeExpenseReport(dataset.fiscal_id, dataset.report_name, dataset.renderer);
  });

  it('report has been saved into archive', () => {
    Page.checkSavedIncomeExpenseReport(dataset.report_name);
  });

  it('print the previewed report', () => {
    Page.printIncomeExpenseReport(dataset.fiscal_id);
  });
});
