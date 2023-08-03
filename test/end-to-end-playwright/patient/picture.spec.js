const path = require('path');
const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../shared/TestUtils');
const { by } = require('../shared/TestUtils');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

const components = require('../shared/components');

const fixtures = path.resolve(__dirname, '../../fixtures/');

test.describe('Patient Record', () => {
  const root = '/#!/patients/';
  const id = '274c51ae-efcc-4238-98c6-f402bfb39866';

  test.beforeEach(async () => {
    await TU.navigate(root.concat(id));
  });

  test('uploads a patient picture', async () => {
    const fileToUpload = 'patient.png';
    const absolutePath = path.resolve(fixtures, fileToUpload);
    await TU.uploadFile(absolutePath, by.id('upload-patient-photo'));
    await components.notification.hasSuccess();
  });

  test('unable to upload a file that is not a picture', async () => {
    const fileToUpload = 'sample.pdf';
    const absolutePath = path.resolve(fixtures, fileToUpload);
    await TU.uploadFile(absolutePath, by.id('upload-patient-photo'));
    await components.notification.hasDanger();
  });
});
