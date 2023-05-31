const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../shared/TestUtils');

const components = require('../shared/components');
const MergePatientPage = require('./registry.merge.page');

function MergePatientTest() {

  test.beforeAll(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    TU.registerPage(page);
    await TU.login();
  });

  test.beforeEach(async () => {
    await TU.navigate('patients');
  });

  const Page = new MergePatientPage();

  test('forbid selection of more than two patients', async () => {
    await Page.gridSelectRows(1, 2, 3);
    await Page.openMergeTool();
    await components.notification.hasWarn();

    // unselect all patients
    await Page.gridSelectRows(1, 2, 3);
  });

  test('successfully merge two selected patients into one', async () => {
    const reference = 'PA.TPA.2';
    await Page.gridSelectRows(2, 3);
    await Page.openMergeTool();
    await Page.selectPatientToKeep(reference);
    await Page.merge();
    await components.notification.hasSuccess();
  });
}

module.exports = MergePatientTest;
