/* global browser, element, by */

const chai = require('chai');
const helpers = require('../../shared/helpers');

helpers.configure(chai);

const ReportDebtorsPage = require('./aged_debtors.page');

describe('Aged Debtors Report ::', () => {
  let Page;
  const key = 'aged_debtors';

  const dataset = {
    include_zeroes : true,
    exclude_zeroes : false,
    report_name : 'Report Saved by E2E',
    renderer : 'PDF',
    period_1 : 'juin 2017',
    period_2 : 'mai 2017',
  };

  before(() => {
    helpers.navigate(`#!/reports/${key}`);
    Page = new ReportDebtorsPage(key);
  });

  it('preview a new Aged Debtors Report', () => {
    Page.showDebtorsReportPreview(dataset.period_1, dataset.include_zeroes);
  });

  it('close the previewed report', () => {
    Page.closeDebtorsReportPreview();
  });

  it('save a previewed report', () => {
    Page.saveDebtorsReport(dataset.period_2, dataset.exclude_zeroes, dataset.report_name, dataset.renderer);
  });

  it('report has been saved into archive', () => {
    Page.checkSavedDebtorsReport(dataset.report_name);
  });

  it('print the previewed report', () => {
    Page.printDebtorsReport(dataset.period_2, dataset.include_zeroes);
  });
});
