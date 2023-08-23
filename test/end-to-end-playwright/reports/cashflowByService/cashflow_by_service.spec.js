const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../../shared/TestUtils');

const ReportCashflowPage = require('./cashflow_by_service.page');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

test.describe('Cashflow By Service Report', () => {
  let page;
  const key = 'cashflow_by_service';

  const date = {
    cashbox      : 'Caisse Auxiliaire Fc',
    date_range   : 'year',
    date_range2  : 'month',
    dateFrom     : '01/01/2017',
    dateTo       : '01/04/2017',
    report_name  : 'Cashflow Report',
    renderer     : 'PDF',
  };

  test.beforeEach(async () => {
    await TU.navigate(`/#!/reports/${key}`);
    page = new ReportCashflowPage(key);
  });

  test('preview a new Cashflow By Service Report', async () => {
    await page.showCashflowByServiceReportPreview(date.date_range, null, null, date.cashbox);
    await page.closeCashflowByServiceReportPreview();
  });

  test('save a previewed report', async () => {
    await page.saveCashflowByServiceReport(
      null,
      date.dateFrom,
      date.dateTo,
      date.cashbox,
      date.report_name,
      date.renderer,
    );
  });

  test('report has been saved into archive', async () => {
    await page.checkSavedCashflowByServiceReport(date.report_name);
  });

  test('print the previewed report', async () => {
    await page.printCashflowByServiceReport(date.date_range2, null, null, date.cashbox);
  });
});
