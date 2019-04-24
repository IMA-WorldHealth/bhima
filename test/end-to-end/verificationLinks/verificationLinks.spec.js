/* global element, by */
const helpers = require('../shared/helpers');
const Filters = require('../shared/components/bhFilters');
const GU = require('../shared/GridUtils');
const GridRow = require('../shared/GridRow');

describe('Check Inter-Registry Links', () => {
  const path = '#!/';
  const filters = new Filters();

  before(() => helpers.navigate(path));

  it('Checks the link between Patient Groups -> Patient Registry', async () => {
    await helpers.navigate('#!/patients/groups');
    const menu = await openDropdownMenu('Test Patient Group 2');
    await menu.goToPatient().click();
    await GU.expectRowCount('patient-registry', 2);
  });

  // skip until we can re-write the tests to find debtor groups based on name.
  it.skip('Checks the link between Debtor Groups -> Patient Registry', async () => {
    await helpers.navigate('#!/debtors/groups');
    await element.all(by.css('[class="fa fa-bars"]')).get(1).click();
    await GU.expectRowCount('patient-registry', 3);
  });

  // skip this until we can filter on used Patient Registry. (@lomamech)
  it.skip('Checks the link between Patient Registry -> Invoice Registry', async () => {
    await helpers.navigate('#!/patients');
    await filters.resetFilters();

    await element.all(by.css('[data-method="action"]')).get(3).click();
    await element.all(by.css('[data-method="invoice"]')).get(3).click();
    await GU.expectRowCount('invoice-registry', 3);
  });

  it('Checks the link between Invoice Registry -> Cash Registry', async () => {
    await helpers.navigate('#!/invoices');

    const row = new GridRow('IV.TPA.4');
    await row.dropdown().click();
    await row.goToPayment().click();

    await GU.expectRowCount('payment-registry', 0);
  });

  // skip this until we can filter on used inventory items.
  it.skip('Checks the link between Inventory Registry -> Invoice Registry', async () => {
    await helpers.navigate('#!/inventory/list');
    await filters.resetFilters();
    await element.all(by.css('[data-method="action"]')).get(3).click();
    await element.all(by.css('[data-method="invoice"]')).get(3).click();
    await GU.expectRowCount('invoice-registry', 2);
  });

  it('Checks the link between Invoice Registry -> Voucher Registry', async () => {
    await helpers.navigate('#!/invoices');
    await filters.resetFilters();
    const row = new GridRow('IV.TPA.1');
    await row.dropdown().click();
    await row.goToVoucher().click();

    await GU.expectRowCount('voucher-grid', 1);
  });

  it('Checks the link between Cash Registry -> Voucher Registry', async () => {
    await helpers.navigate('#!/payments');
    await filters.resetFilters();
    const row = new GridRow('CP.TPA.3');
    await row.dropdown().click();
    await row.goToVoucher().click();

    await GU.expectRowCount('voucher-grid', 1);
    await filters.resetFilters();
  });

  async function openDropdownMenu(label) {
    const row = new GridRow(label);
    await row.dropdown().click();
    return row;
  }
});
