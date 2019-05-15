const helpers = require('../../shared/helpers');
const ReportStockExitPage = require('./stock_exit.page');

describe('StockExit Report', () => {
  let page;
  const key = 'stock_exit';

  const dataset = {
    depot           : 'Depot Principal',
    dateFrom        : '01/01/2018',
    dateTo          : '31/12/2018',
    report_name     : 'StockExit Report',
    renderer        : 'PDF',
  };

  before(async () => {
    await helpers.navigate(`#!/reports/${key}`);
    page = new ReportStockExitPage(key);
  });

  it('preview a new StockExit Report', async () => {
    await page.showStockExitReportPreview(dataset.depot, dataset.dateFrom, dataset.dateTo);
  });

  it('close the previewed report', async () => {
    await page.closeStockExitReportPreview();
  });

  it('save a previewed report', async () => {
    await page.saveStockExitReport(
      dataset.dateFrom,
      dataset.dateTo,
      dataset.depot,
      dataset.report_name,
      dataset.renderer
    );
  });

  it('report has been saved into archive', async () => {
    await page.checkSavedStockExitReport(dataset.report_name);
  });

  it('print the previewed report', async () => {
    await page.printStockExitReport(dataset.depot, dataset.dateFrom, dataset.dateTo);
  });
});
