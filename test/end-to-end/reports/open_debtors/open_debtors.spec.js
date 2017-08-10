/* global browser */

const chai = require('chai');
const helpers = require('../../shared/helpers');

helpers.configure(chai);

const ReportOpenDebtorsPage = require('./open_debtors.page');

describe('Open Debtors Report', () => {
  let Page;
  const key = 'open_debtors';

  const dataset = {
    order : 'Total',
    report_name : 'Open Debtors Report, Order by Debts',
    renderer : 'PDF',
  };

  before(() => {
    helpers.navigate(`#!/reports/${key}`);
    Page = new ReportOpenDebtorsPage(key);
    browser.refresh();
  });

  it(`preview a new Open Debtors report - order by ${dataset.order}`, () => {
    Page.showOpenDebtorsReportPreview(dataset.order);
  });

  it('close the previewed report', () => {
    Page.closeOpenDebtorsReportPreview();
  });

  it('save a previewed report', () => {
    Page.saveOpenDebtorsReport(dataset.order, dataset.report_name, dataset.renderer);
  });

  it('report has been saved into archive', () => {
    Page.checkSavedOpenDebtorsReport(dataset.report_name);
  });

  it('print the previewed report', () => {
    Page.printOpenDebtorsReport(dataset.order);
  });
});
