const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../shared/TestUtils');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

const DataCollectorManagement = require('./dataCollectorManagement.page');

test.describe('Data Collector Management', () => {
  let page;

  // navigate to the page
  test.beforeEach(async () => {
    await TU.navigate('/#!/data_collector_management');
    page = await DataCollectorManagement.new();
  });

  const newDataCollector = {
    label : 'Consultations externes',
    description : '2. CONSULTATIONS / 2.1. Consultations externes',
    version_number : '1',
    color : 'burlywood',
    is_related_patient : '1',
  };

  const updateDataCollector = {
    label : 'Consultations aux urgences',
    version_number : '1',
    color : 'chartreuse',
  };

  test('successfully creates a new Data Collector Management', async () => {
    await page.create(newDataCollector);
  });

  test('successfully edits a Data Collector Management', async () => {
    await page.edit(newDataCollector.label, updateDataCollector);
  });

  test('do not create when incorrect Data Collector Management', async () => {
    await page.errorOnCreate();
  });

  test('successfully delete a Data Collector Management', async () => {
    await page.delete(updateDataCollector.label);
  });
});
