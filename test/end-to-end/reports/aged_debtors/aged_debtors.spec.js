const helpers = require('../../shared/helpers');
const ReportDebtorsPage = require('./aged_debtors.page');

describe('Aged Debtors Report', () => {
  let Page;
  const key = 'aged_debtors';

  const dataset = {
    include_zeroes : true,
    report_name : 'Aged Debtors Report Saved by E2E',
    renderer : 'PDF',
    year : '2015',
    month : 'Mai 2015',
    month2 : 'Juin 2015',
    currency_id : 2,
  };

  before(async () => {
    await helpers.navigate(`#!/reports/${key}`);
    Page = new ReportDebtorsPage(key);
  });

  it('preview a new Aged Debtors Report', async () => {
    await Page.showDebtorsReportPreview(dataset.year, dataset.month, dataset.include_zeroes,
      dataset.currency_id);
  });

  it('close the previewed report', async () => {
    await Page.closeDebtorsReportPreview();
  });

  it('save a previewed report', async () => {
    await Page.saveDebtorsReport(dataset.year, dataset.month2, false, dataset.report_name,
      dataset.renderer, dataset.currency_id);
  });

  it('report has been saved into archive', async () => {
    await Page.checkSavedDebtorsReport(dataset.report_name);
  });

  it('print the previewed report', async () => {
    await Page.printDebtorsReport(dataset.year, dataset.month, dataset.include_zeroes, dataset.currency_id);
  });
});
