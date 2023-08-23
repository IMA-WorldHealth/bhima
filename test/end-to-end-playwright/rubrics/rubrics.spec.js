const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../shared/TestUtils');

const RubricPage = require('./rubrics.page');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

test.describe('Rubrics Management', () => {

  test.beforeEach(async () => {
    await TU.navigate('/#!/payroll/rubrics');
  });

  const page = new RubricPage();

  const rubric = {
    label : 'RUBRIC SYNDICAL',
    abbr  : 'CoSynd',
    is_percent : 1,
    debtor_account_id : '40111002', // SUPPLIER'S ACCOUNT 1
    expense_account_id : '60310015', // Achat Produit  de Perfusion
    value : 6.5,
    is_discount : 1,
    is_membership_fee : 0,
    is_tax : 1,
    is_employee : 1,
  };

  const updateRubric = {
    label : 'CHEF COMPTABLE',
    is_percent : 0,
  };

  test('successfully creates a new rubric', async () => {
    await page.create(rubric);
  });

  test('successfully edits a rubric', async () => {
    await page.update(rubric.label, updateRubric);
  });

  test('do not create when incorrect rubric', async () => {
    await page.errorOnCreateRubric();
  });

  test('successfully deletes a rubric', async () => {
    await page.remove(updateRubric.label);
  });

  test('successfully import indexes rubrics', async () => {
    await page.importIndexesRubric();
  });
});
