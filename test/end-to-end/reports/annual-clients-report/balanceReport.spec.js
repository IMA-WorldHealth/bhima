/* global browser */

const helpers = require('../../shared/helpers');
const AnnualClientsReportReportPage = require('./balance.page');

describe('Annual Clients Report', () => {
  const key = 'annual-clients-report';
  let Page;

  const dataset = {
    fiscalYear : 'Test Fiscal Year 2016',
    report_name : 'Annual Clients Report saved by E2E',
    renderer : 'PDF',
  };

  before(() => {
    helpers.navigate(`#!/reports/${key}`);
    Page = new AnnualClientsReportReportPage(key);
    browser.refresh();
  });

  it('preview a new debtor client account balance report', () => {
    Page.showAnnualClientsReportPreview(dataset.fiscalYear);
  });

  it('close the previewed report', () => {
    Page.closeAnnualClientsReportPreview();
  });

  it('save a previewed report', () => {
    Page.saveAnnualClientsReport(dataset.fiscalYear, dataset.report_name, dataset.renderer);
  });

  it('report has been saved into archive', () => {
    Page.checkSavedAnnualClientsReport(dataset.report_name);
  });

  it('print the previewed report', () => {
    Page.printAnnualClientsReport(dataset.fiscalYear);
  });
});
