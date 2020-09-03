const GU = require('../shared/GridUtils');
const helpers = require('../shared/helpers');

const Filters = require('../shared/components/bhFilters');
const SearchModal = require('../shared/search.page');
const components = require('../shared/components');

describe('Payments Registry', CashPaymentsRegistryTests);

function CashPaymentsRegistryTests() {
  const PAYMENT_INSIDE_REGISTRY = 3;
  const PAYMENT_PRIMARY_CASHBOX = 0;
  const DEBTOR_GROUP = 'Church Employees';
  let modal;
  let filters;

  before(() => helpers.navigate('!#/payments'));

  beforeEach(async () => {
    await SearchModal.open();
    modal = new SearchModal('cash-payment-search');
    filters = new Filters();
  });

  afterEach(async () => {
    await filters.resetFilters();
  });

  it('finds only 2 payment for today', async () => {
    const DEFAULT_PAYMENTS_FOR_TODAY = 2;
    await modal.switchToDefaultFilterTab();
    await modal.setPeriod('today');
    await modal.submit();
    await GU.expectRowCount('payment-registry', DEFAULT_PAYMENTS_FOR_TODAY);
  });

  it('finds 2 payments for this last year', async () => {
    const DEFAULT_PAYMENTS_FOR_LAST_YEAR = 2;
    await modal.switchToDefaultFilterTab();
    await modal.setPeriod('year');
    await modal.submit();
    await GU.expectRowCount('payment-registry', DEFAULT_PAYMENTS_FOR_LAST_YEAR);
  });

  it(`finds ${PAYMENT_INSIDE_REGISTRY} payments for all time`, async () => {
    await modal.switchToDefaultFilterTab();
    await modal.setPeriod('allTime');
    await modal.submit();
    await GU.expectRowCount('payment-registry', PAYMENT_INSIDE_REGISTRY);
  });

  it('finds a payment given a reference', async () => {
    await modal.setReference('CP.TPA.1');
    await modal.submit();
    await GU.expectRowCount('payment-registry', 1);
  });

  it('produces an empty grid for an invalid payment', async () => {
    await modal.setReference('NOT_A_REFERENCE');
    await modal.submit();
    await GU.expectRowCount('payment-registry', 0);
  });

  it('finds two payments in the primary cashbox', async () => {
    await modal.setReference('Caisse Principale');
    await modal.submit();
    await GU.expectRowCount('payment-registry', PAYMENT_PRIMARY_CASHBOX);
  });

  it('finds all payments made by the super user', async () => {
    await modal.setUser('Super User');
    await modal.submit();
    await GU.expectRowCount('payment-registry', PAYMENT_INSIDE_REGISTRY);
  });

  it(`finds all payments for debtor group: ${DEBTOR_GROUP}`, async () => {
    await components.debtorGroupSelect.set(DEBTOR_GROUP);
    await modal.submit();
    await GU.expectRowCount('payment-registry', PAYMENT_INSIDE_REGISTRY);
  });

  it('finds no payments for the disallowed user', async () => {
    await modal.setUser('Regular User');
    await modal.submit();
    await GU.expectRowCount('payment-registry', 0);
  });
}
