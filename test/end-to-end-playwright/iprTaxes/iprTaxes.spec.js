const { chromium } = require('@playwright/test');
const { test, expect } = require('@playwright/test');
const TU = require('../shared/TestUtils');
const { by } = require('../shared/TestUtils');

const IprTaxPage = require('./iprTaxes.page');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

test.describe('Ipr Tax Management', () => {

  test.beforeEach(async () => {
    await TU.navigate('/#!/ipr_tax');
  });

  const page = new IprTaxPage();

  const iprTax1 = {
    label         : 'IPR 1995',
    description   : 'Impot Professionnel sur le revenu 1995',
    currency_id   : 2,
  };

  const iprTax2 = {
    label         : 'IPR 2000',
    description   : 'Impot Professionnel sur le revenu 2000',
    currency_id   : 2,
  };

  const iprTax3 = {
    label         : 'IPR 2013',
    description   : 'Impot Professionnel sur le revenu 2013',
    currency_id   : 1,
  };

  const updateIPR = {
    label         : 'IPR 1995 Updated',
    description   : 'Impot Professionnel sur le revenu 2000',
    currency_id   : 2,
  };

  test.skip('should start with one IPR taxes', async () => {
    // @TODO: Fix this. It brings up a blank page. Various waits,etc, do not help
    expect(await page.count()).toBe(1);
  });

  test('successfully creates a new IPR Scale 1995', async () => {
    await page.create(iprTax1);
    expect(await page.count()).toBe(2);
  });

  test('successfully creates a new IPR Scale 2000', async () => {
    await page.create(iprTax2);
  });

  test('successfully creates a new IPR Scale 2013', async () => {
    await page.create(iprTax3);
  });

  test('successfully edits an IPR Tax', async () => {
    await page.update(iprTax1.label, updateIPR);
  });

  test('successfully delete a Ipr tax Scale', async () => {
    await page.remove(updateIPR.label);
  });

  test('do not create when incorrect Ipr Tax', async () => {
    await page.errorOnCreateIprTax();
  });

  test.skip('should end with three IPR taxes', async () => {
    // @TODO: Fix this. It brings up a blank page. Various waits,etc, do not help
    expect(await page.count()).toBe(3);
  });
});
