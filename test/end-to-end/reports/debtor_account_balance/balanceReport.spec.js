/* global browser */

const helpers = require('../../shared/helpers');
const DebtorClientAccountBalanceReportPage = require('./balance.page');

describe('Debtor Clients Account Balance Report', () => {
  const key = 'debtorBalanceReport';
  let Page;

  const dataset = {
    fiscalYear : 'Test Fiscal Year 2016',
    report_name : 'debtor client accounts balance Saved by E2E',
    renderer : 'PDF',
  };

  before(() => {
    helpers.navigate(`#!/reports/${key}`);
    Page = new DebtorClientAccountBalanceReportPage(key);
    browser.refresh();
  });

  it('preview a new debtor client account balance report', () => {
    Page.showDebtorAccountBalanceReportPreview(dataset.fiscalYear);
  });

  it('close the previewed report', () => {
    Page.closeDebtorAccountBalanceReportPreview();
  });

  it('save a previewed report', () => {
    Page.saveDebtorAccountBalanceReport(dataset.fiscalYear, dataset.report_name, dataset.renderer);
  });

  it('report has been saved into archive', () => {
    Page.checkSavedDebtorAccountBalanceReport(dataset.report_name);
  });

  it('print the previewed report', () => {
    Page.printDebtorAccountBalanceReport(dataset.fiscalYear);
  });
});
