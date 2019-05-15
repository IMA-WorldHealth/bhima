const ReportAccountPage = require('./account_report.page');
const helpers = require('../../shared/helpers');

// @FIXME skip end to end tests until form validation and components are finalised
describe.skip('Accounts Report', () => {
  let Page;
  const key = 'account_report';

  const dataset = {
    account : 'Guest House',
    report_name : 'Report Saved by E2E',
    renderer : 'PDF',
  };

  before(async () => {
    await helpers.navigate(`#!/reports/${key}`);
    Page = new ReportAccountPage(key);
  });

  it('preview a new account report', async () => {
    await Page.showAccountReportPreview(dataset.account);
  });

  it('close the previewed report', async () => {
    await Page.closeAccountReportPreview();
  });

  it('save a previewed report', async () => {
    await Page.saveAccountReport(dataset.account, dataset.report_name, dataset.renderer);
  });

  it('report has been saved into archive', async () => {
    await Page.checkSavedAccountReport(dataset.report_name);
  });

  it('print the previewed report', async () => {
    await Page.printAccountReport(dataset.account);
  });
});
