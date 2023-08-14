const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../../shared/TestUtils');

const AnnualClientsReportReportPage = require('./balance.page');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

test.describe('Annual Clients Report', () => {
  const key = 'annual_clients_report';
  let page;

  const dataset = {
    fiscalYear : 'Test Fiscal Year 2016',
    report_name : 'Annual Clients Report saved by E2E',
    renderer : 'PDF',
  };

  test.beforeEach(async () => {
    await TU.navigate(`/#!/reports/${key}`);
    page = new AnnualClientsReportReportPage(key);
  });

  test('preview a new debtor client account balance report', async () => {
    await page.showAnnualClientsReportPreview(dataset.fiscalYear);
    await page.closeAnnualClientsReportPreview();
  });

  test('save a previewed report', async () => {
    await page.saveAnnualClientsReport(dataset.fiscalYear, dataset.report_name, dataset.renderer);
  });

  test('report has been saved into archive', async () => {
    await page.checkSavedAnnualClientsReport(dataset.report_name);
  });

  test('print the previewed report', async () => {
    await page.printAnnualClientsReport(dataset.fiscalYear);
  });
});
