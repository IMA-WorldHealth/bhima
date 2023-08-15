const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../../shared/TestUtils');

const ReportCashflowPage = require('./cashflow.page');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

test.describe('Cashflow Report', () => {
  let page;
  const key = 'cashflow';

  const data = {
    cashboxes       : ['Caisse Auxiliaire'],
    dateFrom        : '01/01/2018',
    dateTo          : '31/12/2018',
    report_name     : 'Cashflow Report',
    renderer        : 'PDF',
    previousCashbox : ['Caisse Auxiliaire'], // Note: Not currently saved
  };

  test.beforeEach(async () => {
    await TU.navigate(`/#!/reports/${key}`);
    page = new ReportCashflowPage(key);
  });

  // @TODO: Fix.  Works alone but fails with other tests
  test.skip('preview a new Cashflow Report', async () => {
    await page.showCashflowReportPreview(data.cashboxes, data.dateFrom, data.dateTo);
    await page.closeCashflowReportPreview();
  });

  // @TODO: Fix.  Works alone but fails with other tests
  test.skip('save a previewed report', async () => {
    await page.saveCashflowReport(
      data.dateFrom,
      data.dateTo,
      data.previousCashbox,
      data.report_name,
      data.renderer,
    );
  });

  // @TODO: Fix.  Works alone but fails with other tests
  test.skip('report has been saved into archive', async () => {
    await page.checkSavedCashflowReport(data.report_name);
  });

  // @TODO: Fix.  Works alone but fails with other tests
  test.skip('print the previewed report', async () => {
    await page.printCashflowReport(data.cashboxes, data.dateFrom, data.dateTo);
  });
});
