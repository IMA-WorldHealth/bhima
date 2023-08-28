const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../../shared/TestUtils');

const ReportStockExitPage = require('./stock_exit.page');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

test.describe('StockExit Report', () => {
  let page;
  const key = 'stock_exit';

  const dataset = {
    depot           : 'Depot Principal',
    dateFrom        : '01/01/2022',
    dateTo          : '31/12/2022',
    report_name     : 'StockExit Report',
    renderer        : 'PDF',
  };

  test.beforeEach(async () => {
    await TU.navigate(`/#!/reports/${key}`);
    page = new ReportStockExitPage(key);
  });

  test('preview a new StockExit Report', async () => {
    await page.showStockExitReportPreview(dataset.depot, dataset.dateFrom, dataset.dateTo);
    // await page.closeStockExitReportPreview();
  });

  // @TODO: Needs fixing; the report page does not finish loading

  test.skip('save a previewed report', async () => {
    await page.saveStockExitReport(
      dataset.dateFrom,
      dataset.dateTo,
      dataset.depot,
      dataset.report_name,
      dataset.renderer,
    );
  });

  test.skip('report has been saved into archive', async () => {
    await page.checkSavedStockExitReport(dataset.report_name);
  });

  test.skip('print the previewed report', async () => {
    await page.printStockExitReport(dataset.depot, dataset.dateFrom, dataset.dateTo);
  });
});
