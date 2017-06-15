/* global browser, element, by */

const chai = require('chai');
const helpers = require('../../shared/helpers');

helpers.configure(chai);

const ReportAccountPage = require('./account_report.page');

// @FIXME skip end to end tests until form validation and components are finalised
describe.skip('Accounts report ::', () => {
  let Page;
  const key = 'account_report';

  const dataset = {
    account : '41002',
    report_name : 'Report Saved by E2E',
    renderer : 'PDF',
  };

  before(() => {
    helpers.navigate(`#!/reports/${key}`);
    Page = new ReportAccountPage(key);
  });

  it('preview a new account report', () => {
    Page.showAccountReportPreview(dataset.account);
  });

  it('close the previewed report', () => {
    Page.closeAccountReportPreview();
  });

  it('save a previewed report', () => {
    Page.saveAccountReport(dataset.account, dataset.report_name, dataset.renderer);
  });

  it('report has been saved into archive', () => {
    Page.checkSavedAccountReport(dataset.report_name);
  });

  it('print the previewed report', () => {
    Page.printAccountReport(dataset.account);
  });
});
