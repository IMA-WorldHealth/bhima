const GU = require('../shared/GridUtils');
const helpers = require('../shared/helpers');

const Filters = require('../shared/components/bhFilters');
const SearchModal = require('../shared/search.page');

describe('Payments Registry', CashPaymentsRegistryTests);

function CashPaymentsRegistryTests() {
  const PAYMENT_INSIDE_REGISTRY = 3;
  const PAYMENT_PRIMARY_CASHBOX = 0;
  let modal;
  let filters;

  before(() => helpers.navigate('#/payments'));

  beforeEach(() => {
    SearchModal.open();
    modal = new SearchModal('cash-payment-search');
    filters = new Filters();
  });

  afterEach(() => {
    filters.resetFilters();
  });

  it('finds only one payment for today', () => {
    const DEFAULT_PAYMENTS_FOR_TODAY = 1;
    modal.switchToDefaultFilterTab();
    modal.setPeriod('today');
    modal.submit();
    GU.expectRowCount('payment-registry', DEFAULT_PAYMENTS_FOR_TODAY);
  });

  it('finds one payments for this last year', () => {
    const DEFAULT_PAYMENTS_FOR_TODAY = 1;
    modal.switchToDefaultFilterTab();
    modal.setPeriod('year');
    modal.submit();
    GU.expectRowCount('payment-registry', DEFAULT_PAYMENTS_FOR_TODAY);
  });

  it('finds three payments for all time', () => {
    modal.switchToDefaultFilterTab();
    modal.setPeriod('allTime');
    modal.submit();
    GU.expectRowCount('payment-registry', PAYMENT_INSIDE_REGISTRY);
  });

  it('finds a payment given a reference', () => {
    modal.setReference('CP.TPA.1');
    modal.submit();
    GU.expectRowCount('payment-registry', 1);
  });

  it('produces an empty grid for an invalid payment', () => {
    modal.setReference('NOT_A_REFERENCE');
    modal.submit();
    GU.expectRowCount('payment-registry', 0);
  });

  it('finds two payments in the primary cashbox', () => {
    modal.setReference('Test Primary Cashbox A');
    modal.submit();
    GU.expectRowCount('payment-registry', PAYMENT_PRIMARY_CASHBOX);
  });

  it('finds all payments made by the super user', () => {
    modal.setUser('Super User');
    modal.submit();
    GU.expectRowCount('payment-registry', PAYMENT_INSIDE_REGISTRY);
  });

  it('finds all payments for creditor group Second Test Debtor Group', () => {
    modal.setDebtorGroup('Second Test Debtor Group');
    modal.submit();
    GU.expectRowCount('payment-registry', PAYMENT_INSIDE_REGISTRY);
  });

  it('finds no payments for the disallowed user', () => {
    modal.setUser('Regular User');
    modal.submit();
    GU.expectRowCount('payment-registry', 0);
  });
}

