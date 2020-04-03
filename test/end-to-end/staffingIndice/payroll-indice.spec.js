/* global browser, element, by */
const EC = require('protractor').ExpectedConditions;
const helpers = require('../shared/helpers');
const GridRow = require('../shared/GridRow');
const components = require('../shared/components');
const Search = require('../payrollProcess/searchModal.page');
const FU = require('../shared/FormUtils');

const searchModalPage = new Search();
describe('Multipayroll (indice)', () => {

  const path = '#!/multiple_payroll_indice';
  // navigate to the page before the test suite
  before(() => helpers.navigate(path));

  const conf1 = {
    display_name : 'TEST 2 PATIENT',
  };

  const conf2 = {
    display_name : 'EMPLOYEE TEST 1',
  };

  const defaultValue = {
    period      : 'Juin 2019',
    currency    : 2,
  };

  it(`should search period`, async () => {
    await searchModalPage.payrollPeriod(defaultValue.period);
    await searchModalPage.selectCurrency(defaultValue.currency);
    await searchModalPage.submit();
  });

  it(`should a config Staffing indice for ${conf1.display_name}`, async () => {
    const menu = await openDropdownMenu(conf1.display_name);
    await menu.edit().click();
    await components.inpuText.set('ConfigPaiementForm_Jours_prestes', 26);
    await components.inpuText.set('ConfigPaiementForm_Jours_supplementaires', 2);

    await FU.buttons.submit();
    await components.notification.hasSuccess();
  });

  it(`should a config Staffing indice for ${conf2.display_name}`, async () => {
    const menu = await openDropdownMenu(conf2.display_name);
    await menu.edit().click();
    await components.inpuText.set('ConfigPaiementForm_Jours_prestes', 23);
    await components.inpuText.set('ConfigPaiementForm_Jours_supplementaires', 0);

    await FU.buttons.submit();
    await components.notification.hasSuccess();
  });

  it(`should set the enveloppe salarial`, async () => {
    await browser.wait(EC.presenceOf(element(by.css('[data-action="open-menu"]'))), 5000, 'Action link not visible.');
    await element(by.css('[data-action="open-menu"]')).click();
    await element(by.css('[data-method="configure-payment"]')).click();
    await searchModalPage.payrollPeriod(defaultValue.period);

    await components.currencyInput.set(100000, 'enveloppe_salarial');
    await components.inpuText.set('working_days', 26);

    await FU.buttons.submit();
    await components.notification.hasSuccess();
  });

  async function openDropdownMenu(label) {
    const row = new GridRow(label);
    await browser.wait(EC.presenceOf(row.dropdown()), 5000, 'Action link not visible.');
    await row.dropdown().click();
    return row;
  }


});
