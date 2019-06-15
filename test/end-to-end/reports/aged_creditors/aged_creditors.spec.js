const helpers = require('../../shared/helpers');
const ReportCreditorsPage = require('./aged_creditors.page');

describe('Aged Creditors Report', () => {
  let Page;
  const key = 'aged_creditors';

  const dataset = {
    include_zeroes : true,
    report_name : 'Aged Creditors Report Saved by E2E',
    renderer : 'PDF',
    year : '2015',
    month : 'Mai 2015',
    month2 : 'Juin 2015',
  };

  before(async () => {
    await helpers.navigate(`#!/reports/${key}`);
    Page = new ReportCreditorsPage(key);
  });

  it('preview a new Aged Creditors Report', async () => {
    await Page.showCreditorsReportPreview(dataset.year, dataset.month, dataset.include_zeroes);
  });

  it('close the previewed report', async () => {
    await Page.closeCreditorsReportPreview();
  });

  it('save a previewed report', async () => {
    await Page.saveCreditorsReport(dataset.year, dataset.month2, false, dataset.report_name, dataset.renderer);
  });

  it('report has been saved into archive', async () => {
    await Page.checkSavedCreditorsReport(dataset.report_name);
  });

  it('print the previewed report', async () => {
    await Page.printCreditorsReport(dataset.year, dataset.month, dataset.include_zeroes);
  });
});
