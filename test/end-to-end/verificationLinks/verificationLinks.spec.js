/* global element, by */
const helpers = require('../shared/helpers');
const Filters = require('../shared/components/bhFilters');
const GU = require('../shared/GridUtils');
const GridRow = require('../shared/GridRow');

describe('Check Inter-Registry Links', () => {
  const path = '#!/';
  const filters = new Filters();

  before(() => helpers.navigate(path));

  it('Checks the link between Patient Groups -> Patient Registry', () => {
    helpers.navigate('#!/patients/groups');
    element.all(by.css('[class="fa fa-list"]')).get(2).click();
    GU.expectRowCount('patient-registry', 2);
  });

  it('Checks the link between Debtor Groups -> Patient Registry', () => {
    helpers.navigate('#!/debtors/groups');
    element.all(by.css('[class="fa fa-bars"]')).get(1).click();
    GU.expectRowCount('patient-registry', 3);
  });

  it('Checks the link between Patient Registry -> Invoice Registry', () => {
    helpers.navigate('#!/patients');
    filters.resetFilters();

    element.all(by.css('[data-method="action"]')).get(3).click();
    element.all(by.css('[data-method="invoice"]')).get(3).click();
    GU.expectRowCount('invoice-registry', 3);
  });

  it('Checks the link between Invoice Registry -> Cash Registry', () => {
    helpers.navigate('#!/invoices');

    const row = new GridRow('IV.TPA.4');
    row.dropdown().click();
    row.goToPayment().click();

    GU.expectRowCount('payment-registry', 0);
  });

  // skip this until we can filter on used inventory items.
  it.skip('Checks the link between Inventory Registry -> Invoice Registry', () => {
    helpers.navigate('#!/inventory/list');
    filters.resetFilters();
    element.all(by.css('[data-method="action"]')).get(3).click();
    element.all(by.css('[data-method="invoice"]')).get(3).click();
    GU.expectRowCount('invoice-registry', 2);
  });

  it('Checks the link between Invoice Registry -> Voucher Registry', () => {
    helpers.navigate('#!/invoices');
    filters.resetFilters();
    const row = new GridRow('IV.TPA.2');
    row.dropdown().click();
    row.goToVoucher().click();

    GU.expectRowCount('voucher-grid', 1);
  });

  it('Checks the link between Cash Registry -> Voucher Registry', () => {
    helpers.navigate('#!/payments');
    filters.resetFilters();
    const row = new GridRow('CP.TPA.3');
    row.dropdown().click();
    row.goToVoucher().click();

    GU.expectRowCount('voucher-grid', 1);
    filters.resetFilters();
  });

});
