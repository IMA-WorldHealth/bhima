const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../../shared/TestUtils');

const ReportCreditorsPage = require('./aged_creditors.page');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

test.describe('Aged Creditors Report', () => {
  let page;
  const key = 'aged_creditors';

  const dataset = {
    include_zeroes : true,
    report_name : 'Aged Creditors Report Saved by E2E',
    renderer : 'PDF',
    year : 'Fiscal Year 2021',
    month : 'January 2021',
    month2 : 'June 2021',
  };

  test.beforeEach(async () => {
    await TU.navigate(`/#!/reports/${key}`);
    page = new ReportCreditorsPage(key);
  });

  test('preview a new Aged Creditors Report', async () => {
    await page.showCreditorsReportPreview(dataset.year, dataset.month, dataset.include_zeroes);
    await page.closeCreditorsReportPreview();
  });

  test('save a previewed report', async () => {
    await page.saveCreditorsReport(dataset.year, dataset.month2, false, dataset.report_name, dataset.renderer);
  });

  test('report has been saved into archive', async () => {
    await page.checkSavedCreditorsReport(dataset.report_name);
  });

  test('print the previewed report', async () => {
    await page.printCreditorsReport(dataset.year, dataset.month, dataset.include_zeroes);
  });
});
