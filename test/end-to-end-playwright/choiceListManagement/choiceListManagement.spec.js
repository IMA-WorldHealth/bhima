const { chromium } = require('@playwright/test');
const { test, expect } = require('@playwright/test');
const TU = require('../shared/TestUtils');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

const ChoiceListManagement = require('./choiceListManagement.page');

test.describe('Choice List Management', () => {

  let page;

  // navigate to the page
  test.beforeEach(async () => {
    TU.navigate('/#!/choices_list_management');
    page = await ChoiceListManagement.new();
  });

  const newChoiceListElement = {
    name : 'oshwe',
    label : 'OSHWE',
  };

  const deleteListElement = {
    name : 'fruit',
    label : 'Fruit',
  };

  const updateChoiceListElement = {
    parent : 'Matonge',
    group_label : 'Avenue',
  };

  test('successfully creates a new Choice List Management', async () => {
    await page.create(newChoiceListElement);
  });

  test('successfully edits a Choice List Management', async () => {
    await page.edit(newChoiceListElement.label, updateChoiceListElement);
  });

  test('do not create when incorrect Choice List Management', async () => {
    await page.errorOnCreate();
  });

  test('successfully creates a deletable element', async () => {
    await page.create(deleteListElement);
  });

  test('successfully delete a list Element', async () => {
    await page.delete(deleteListElement.label);
  });
});
