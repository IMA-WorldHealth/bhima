/* global browser, element, by */

const chai = require('chai');
const helpers = require('../../shared/helpers');

helpers.configure(chai);

const ReportCreditorsPage = require('./aged_creditors.page');

describe('Aged Creditors Report ::', () => {
  let Page;
  const key = 'aged_creditors';

  const dataset = {
    include_zeroes : true,
    exclude_zeroes : false,
    report_name : 'Report Saved by E2E',
    renderer : 'PDF',
    period_1 : 'juin 2016',
    period_2 : 'mai 2015',
  };  

  before(() => {
    helpers.navigate(`#!/reports/${key}`);
    Page = new ReportCreditorsPage(key);
    browser.refresh();
  });

  it('preview a new Aged Creditors Report', () => {
    Page.showCreditorsReportPreview(dataset.period_2, dataset.include_zeroes);
  });

  it('close the previewed report', () => {
    Page.closeCreditorsReportPreview();
  });

  it('save a previewed report', () => {
    Page.saveCreditorsReport(dataset.period_2, dataset.exclude_zeroes, dataset.report_name, dataset.renderer);
  });

  it('report has been saved into archive', () => {
    Page.checkSavedCreditorsReport(dataset.report_name);
  });

  it('print the previewed report', () => {
    Page.printCreditorsReport(dataset.period_1, dataset.include_zeroes);
  });
});