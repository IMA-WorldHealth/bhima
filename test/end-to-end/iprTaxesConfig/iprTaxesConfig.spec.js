const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../shared/TestUtils');

const components = require('../shared/components');

const IprTaxPage = require('../iprTaxes/iprTaxes.page');
const IprTaxConfigPage = require('./iprTaxesConfig.page');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

test.describe('Ipr Tax Configuration Scale Management', () => {

  const path = '/#!/ipr_tax/configuration';

  test.beforeEach(async () => {
    await TU.navigate(path);
  });

  const taxPage = new IprTaxPage();
  const page = new IprTaxConfigPage();

  const iprTaxScale = {
    scale : 'Bareme IPR 2013',
    rate : 0,
    tranche_annuelle_debut : 0,
    tranche_annuelle_fin : 524160,
  };

  const iprTaxScale2 = {
    scale : 'Bareme IPR 2013',
    rate : 15,
    tranche_annuelle_debut : 524160,
    tranche_annuelle_fin : 1428000,
  };

  const iprTax2 = {
    label         : 'IPR 2002',
    description   : 'Impot Professionnel sur le revenu 2002',
    currency_id   : 2,
  };

  const iprTaxScale2002 = {
    scale : 'IPR 2002',
    rate : 20,
    tranche_annuelle_debut : 12000,
    tranche_annuelle_fin : 24000,
  };

  const iprTaxScale2002Update = {
    scale : 'IPR 2002',
    rate : 0,
    tranche_annuelle_debut : 0,
    tranche_annuelle_fin : 72000,
  };

  test('successfully creates a Scale 1 in IPR Scale 2013', async () => {
    await page.createIprTaxConfig(iprTaxScale);
  });

  test('successfully creates a Scale 2 in IPR Scale 2013', async () => {
    await page.createIprTaxConfig(iprTaxScale2);
  });

  test('successfully creates a Scale 1 in IPR Scale 2002', async () => {
    const exists = await components.iprScale.exists(iprTaxScale2002.scale);
    if (!exists) {
      await TU.navigate('/#!/ipr_tax');
      await taxPage.create(iprTax2);
      await TU.navigate(path);
    }

    await page.createIprTaxConfig(iprTaxScale2002);
  });

  test('successfully edits Scale for IPR 2002', async () => {
    await page.editIprTaxConfig(iprTaxScale2002.rate, iprTaxScale2002Update);
  });

  test('successfully delete a Ipr tax Scale', async () => {
    await page.deleteIprTaxConfig(iprTaxScale2002Update.rate);
  });

  test('cannot create when incorrect Ipr Tax', async () => {
    await page.errorOnCreateIprTaxConfig(iprTaxScale.scale);
  });
});
