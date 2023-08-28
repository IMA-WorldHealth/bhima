const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../../shared/TestUtils');

const BalanceReportPage = require('./balance_report.page');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

test.describe('Balance Report', () => {
  let page;
  const key = 'balance_report';

  const data = {
    month : 'June 2018',
    year : 'Fiscal Year 2018',
    reportName : 'Balance Report Saved by E2E',
    renderer : 'PDF',
  };

  const cron = {
    title : 'Balance report 2018',
    group : 'Developers',
    frequency : 'Monthly',
  };

  test.beforeEach(async () => {
    await TU.navigate(`/#!/reports/${key}`);
    page = new BalanceReportPage(key);
  });

  test('preview a new balance report', async () => {
    await page.showBalanceReportPreview(data.year, data.month);
    await page.closeBalanceReportPreview();
  });

  test('save report for cron task of emailing', async () => {
    await page.fillReportOptions(data.year, data.month);
    await page.saveCronEmailReport(cron.title, cron.group, cron.frequency);
  });

  test('save a previewed report', async () => {
    await page.saveBalanceReport(data.year, data.month, data.reportName, data.renderer);
  });

  test('report has been saved into archive', async () => {
    await page.checkSavedBalanceReport(data.reportName);
  });

  test('print the previewed report', async () => {
    await page.printBalanceReport(data.year, data.month);
  });

});
