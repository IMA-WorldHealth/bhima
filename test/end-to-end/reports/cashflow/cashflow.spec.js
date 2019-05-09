const helpers = require('../../shared/helpers');
const ReportCashflowPage = require('./cashflow.page');

describe('Cashflow Report', () => {
  let page;
  const key = 'cashflow';

  const dataset = {
    cashboxes       : ['Caisse Auxiliaire'],
    dateFrom        : '01/01/2018',
    dateTo          : '31/12/2018',
    report_name     : 'Cashflow Report',
    renderer        : 'PDF',
    previousCashbox : [],
  };

  before(async () => {
    await helpers.navigate(`#!/reports/${key}`);
    page = new ReportCashflowPage(key);
  });

  it('preview a new Cashflow Report', async () => {
    await page.showCashflowReportPreview(dataset.cashboxes, dataset.dateFrom, dataset.dateTo);
  });

  it('close the previewed report', async () => {
    await page.closeCashflowReportPreview();
  });

  it('save a previewed report', async () => {
    await page.saveCashflowReport(
      dataset.dateFrom,
      dataset.dateTo,
      dataset.previousCashbox,
      dataset.report_name,
      dataset.renderer
    );
  });

  it('report has been saved into archive', async () => {
    await page.checkSavedCashflowReport(dataset.report_name);
  });

  it('print the previewed report', async () => {
    await page.printCashflowReport(dataset.cashboxes, dataset.dateFrom, dataset.dateTo);
  });
});
