const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../../shared/TestUtils');

const EmployeeStandingPage = require('./employee_standing.page');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

test.describe('Employee Standing Report', () => {
  let page;
  const key = 'employee_standing';

  const date = {
    employee_name : 'Test 2 Patient',
    report_name : 'Employee Standing Report Saved by E2E',
    renderer : 'PDF',
  };

  test.beforeEach(async () => {
    await TU.navigate(`/#!/reports/${key}`);
    page = new EmployeeStandingPage(key);
  });

  test('preview a new Employee Standing Report', async () => {
    await page.showEmployeeReportPreview(date.employee_name);
    await page.closeEmployeeStandingReportPreview();
  });

  test('save a previewed report', async () => {
    await page.saveEmployeeStandingReport(date);
  });

  test('report has been saved into archive', async () => {
    await page.checkSavedEmployeeStandingReport(date.report_name);
  });

  test('print the previewed report', async () => {
    await page.printEmployeeStandingReport(date);
  });

});
