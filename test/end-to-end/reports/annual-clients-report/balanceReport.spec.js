const helpers = require('../../shared/helpers');
const AnnualClientsReportReportPage = require('./balance.page');

describe.skip('Annual Clients Report', () => {
  const key = 'annual_clients_report';
  let Page;

  const dataset = {
    fiscalYear : 'Test Fiscal Year 2016',
    report_name : 'Annual Clients Report saved by E2E',
    renderer : 'PDF',
  };

  before(async () => {
    await helpers.navigate(`#!/reports/${key}`);
    Page = new AnnualClientsReportReportPage(key);
  });

  it('preview a new debtor client account balance report', async () => {
    await Page.showAnnualClientsReportPreview(dataset.fiscalYear);
  });

  it('close the previewed report', async () => {
    await Page.closeAnnualClientsReportPreview();
  });

  it('save a previewed report', async () => {
    await Page.saveAnnualClientsReport(dataset.fiscalYear, dataset.report_name, dataset.renderer);
  });

  it('report has been saved into archive', async () => {
    await Page.checkSavedAnnualClientsReport(dataset.report_name);
  });

  it('print the previewed report', async () => {
    await Page.printAnnualClientsReport(dataset.fiscalYear);
  });
});
