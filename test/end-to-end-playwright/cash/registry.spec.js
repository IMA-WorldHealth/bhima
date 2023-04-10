const { chromium } = require('playwright');
const { test } = require('@playwright/test');
const TU = require('../shared/TestUtils');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

const GU = require('../shared/GridUtils');

const Filters = require('../shared/components/bhFilters');
const SearchModal = require('../shared/search.page');
const components = require('../shared/components');

test.describe('Payments Registry', async () => {

  const PAYMENT_INSIDE_REGISTRY = 3;
  const PAYMENT_PRIMARY_CASHBOX = 0;
  const DEBTOR_GROUP = 'Church Employees';

  let modal;
  let filters;

  test.beforeAll(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    TU.registerPage(page);
    await TU.login();
  });

  test.beforeEach(async () => {
    await TU.navigate('/!#/payments');
    modal = new SearchModal('cash-payment-search');
    await modal.init();
    await modal.open();
    filters = new Filters();
  });

  test.afterEach(async () => {
    await filters.resetFilters();
  });

  test('finds only 1 payment for today', async () => {
    const DEFAULT_PAYMENTS_FOR_TODAY = 1;
    await modal.switchToDefaultFilterTab();
    await modal.setPeriod('today');
    await modal.submit();
    await TU.waitForURL('**/payments');
    await GU.expectRowCount('payment-registry', DEFAULT_PAYMENTS_FOR_TODAY);
  });

  test('finds 2 payments for this year', async () => {
    const DEFAULT_PAYMENTS_FOR_LAST_YEAR = 2;
    await modal.switchToDefaultFilterTab();
    await modal.setPeriod('year');
    await modal.submit();
    await TU.waitForURL('**/payments');
    await GU.expectRowCount('payment-registry', DEFAULT_PAYMENTS_FOR_LAST_YEAR);
  });

  test(`finds ${PAYMENT_INSIDE_REGISTRY} payments for all time`, async () => {
    await modal.switchToDefaultFilterTab();
    await modal.setPeriod('allTime');
    await modal.submit();
    await TU.waitForURL('**/payments');
    await GU.expectRowCount('payment-registry', PAYMENT_INSIDE_REGISTRY);
  });

  test('finds a payment given a reference', async () => {
    await modal.setReference('CP.TPA.1');
    await modal.submit();
    await TU.waitForURL('**/payments');
    await GU.expectRowCount('payment-registry', 1);
  });

  test('produces an empty grid for an invalid payment', async () => {
    await modal.setReference('NOT_A_REFERENCE');
    await modal.submit();
    await TU.waitForURL('**/payments');
    await GU.expectRowCount('payment-registry', 0);
  });

  test('finds two payments in the primary cashbox', async () => {
    await modal.setReference('Caisse Principale');
    await modal.submit();
    await TU.waitForURL('**/payments');
    await GU.expectRowCount('payment-registry', PAYMENT_PRIMARY_CASHBOX);
  });

  test('finds all payments made by the super user', async () => {
    await modal.setUser('Super User');
    await modal.submit();
    await TU.waitForURL('**/payments');
    await GU.expectRowCount('payment-registry', PAYMENT_INSIDE_REGISTRY);
  });

  test(`finds all payments for debtor group: ${DEBTOR_GROUP}`, async () => {
    await components.debtorGroupSelect.set(DEBTOR_GROUP);
    await modal.submit();
    await TU.waitForURL('**/payments');
    await GU.expectRowCount('payment-registry', PAYMENT_INSIDE_REGISTRY);
  });

  test('finds no payments for the disallowed user', async () => {
    await modal.setUser('Regular User');
    await modal.submit();
    await TU.waitForURL('**/payments');
    await GU.expectRowCount('payment-registry', 0);
  });

});
