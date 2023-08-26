const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../../shared/TestUtils');

const PatientStandingPage = require('./patient_standing.page');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

test.describe('Patient Standing Report', () => {
  const key = 'patient_standing';

  const data = {
    patient_name : 'Test 2 Patient',
    report_name : 'Patient Standing Report Saved by E2E',
    renderer : 'PDF',
  };

  test.beforeEach(async () => {
    await TU.navigate(`/#!/reports/${key}`);
  });

  const page = new PatientStandingPage(key);

  test('preview report', async () => {
    await page.showPatientStandingReportPreview(data.patient_name);
    await page.closePatientStandingReportPreview();
  });

  test('save a previewed report', async () => {
    await page.savePatientStandingReport(data);
  });

  test('report has been saved into archive', async () => {
    await page.checkSavedPatientStandingReport(data.report_name);
  });

  test('print the previewed report', async () => {
    await page.printPatientStandingReport(data);
  });

});
