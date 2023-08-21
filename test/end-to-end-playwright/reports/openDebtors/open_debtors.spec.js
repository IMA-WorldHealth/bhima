const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../../shared/TestUtils');

const ReportOpenDebtorsPage = require('./open_debtors.page');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

test.describe('Open Debtors Report', () => {
  let page;
  const key = 'open_debtors';

  const dataset = {
    order : 'Total Debt',
    report_name : 'Open Debtors Report, Order by Debts',
    renderer : 'PDF',
  };

  test.beforeEach(async () => {
    await TU.navigate(`#!/reports/${key}`);
    page = new ReportOpenDebtorsPage(key);
  });

  test(`preview a new Open Debtors report - order by ${dataset.order}`, async () => {
    await page.showOpenDebtorsReportPreview(dataset.order);
    await page.closeOpenDebtorsReportPreview();
  });

  test('save a previewed report', async () => {
    await page.saveOpenDebtorsReport(dataset.order, dataset.report_name, dataset.renderer);
  });

  test('report has been saved into archive', async () => {
    await page.checkSavedOpenDebtorsReport(dataset.report_name);
  });

  test('print the previewed report', async () => {
    await page.printOpenDebtorsReport(dataset.order);
  });
});
