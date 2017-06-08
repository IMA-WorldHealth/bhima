/* global browser, element, by */

const chai = require('chai');
const helpers = require('../../shared/helpers');

helpers.configure(chai);

const ReportAccountPage = require('./account_report.page');

describe('Accounts report ::', () => {
  let Page;
  const key = 'report_accounts';

  const dataset = {
    account : '41002',
    source : 'Grand Livre',
    report_name : 'Report Saved by E2E',
    renderer : 'PDF',
  };

  before(() => {
    helpers.navigate(`#!/reports/${key}`);
    Page = new ReportAccountPage(key);
  });

  it('preview a new account report', () => {
    Page.showAccountReportPreview(dataset.account, dataset.source);
  });

  it('close the previewed report', () => {
    Page.closeAccountReportPreview();
  });

  it('save a previewed report', () => {
    Page.saveAccountReport(dataset.account, dataset.source, dataset.report_name, dataset.renderer);
  });

  it('report has been saved into archive', () => {
    Page.checkSavedAccountReport(dataset.report_name);
  });

  it('print the previewed report', () => {
    Page.printAccountReport(dataset.account, dataset.source);
  });
});
