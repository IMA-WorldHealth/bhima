const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../../shared/TestUtils');

const ReportAccountPage = require('./account_report.page');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

test.describe('Accounts Report', () => {
  let page;
  const key = 'account_report';

  const data = {
    account : 'GUEST HOUSE',
    dateInterval : 'week',
    report_name : 'Report Saved by E2E',
    renderer : 'PDF',
  };

  test.beforeEach(async () => {
    await TU.navigate(`/#!/reports/${key}`);
    page = new ReportAccountPage(key);
  });

  test('preview a new account report', async () => {
    await page.showAccountReportPreview(data.account, data.dateInterval);
    await page.closeAccountReportPreview();
  });

  test('save a previewed report', async () => {
    await page.saveAccountReport(data.account, data.dateInterval, data.report_name, data.renderer);
  });

  test('report has been saved into archive', async () => {
    await page.checkSavedAccountReport(data.report_name);
  });

  test('print the previewed report', async () => {
    await page.printAccountReport(data.account, data.dateInterval);
  });
});
