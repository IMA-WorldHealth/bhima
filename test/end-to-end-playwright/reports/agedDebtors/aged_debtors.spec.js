const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../../shared/TestUtils');

const ReportDebtorsPage = require('./aged_debtors.page');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

test.describe('Aged Debtors Report', () => {
  let page;
  const key = 'aged_debtors';

  const data = {
    include_zeroes : true,
    report_name : 'Aged Debtors Report Saved by E2E',
    renderer : 'PDF',
    year : 'Fiscal Year 2020',
    month : 'May 2020',
    month2 : 'June 2020',
    currency_id : 2,
  };

  test.beforeEach(async () => {
    await TU.navigate(`/#!/reports/${key}`);
    page = new ReportDebtorsPage(key);
  });

  test('preview a new Aged Debtors Report', async () => {
    await page.showDebtorsReportPreview(data.year, data.month, data.include_zeroes,
      data.currency_id);
    await page.closeDebtorsReportPreview();
  });

  test('save a previewed report', async () => {
    await page.saveDebtorsReport(data.year, data.month2, false, data.report_name,
      data.renderer, data.currency_id);
  });

  test('report has been saved into archive', async () => {
    await page.checkSavedDebtorsReport(data.report_name);
  });

  test('print the previewed report', async () => {
    await page.printDebtorsReport(data.year, data.month, data.include_zeroes, data.currency_id);
  });
});
