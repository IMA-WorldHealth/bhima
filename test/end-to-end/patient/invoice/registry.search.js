const Filters = require('../../shared/components/bhFilters');
const SearchModal = require('../../shared/search.page');
const components = require('../../shared/components');
const InvoiceRegistryPage = require('./registry.page.js');

function InvoiceRegistrySearch() {
  let modal;
  let filters;

  const page = new InvoiceRegistryPage();

  beforeEach(async () => {
    await SearchModal.open();
    modal = new SearchModal('invoice-search');
    filters = new Filters();
  });

  afterEach(async () => {
    await filters.resetFilters();
  });

  const DEFAULT_INVOICES_FOR_TODAY = 4;
  it(`filters ${DEFAULT_INVOICES_FOR_TODAY} invoice for today`, async () => {
    await modal.switchToDefaultFilterTab();
    await modal.setPeriod('today');
    await modal.submit();

    await page.expectNumberOfGridRows(DEFAULT_INVOICES_FOR_TODAY);
  });

  const DEFAULT_INVOICES_FOR_ALL_TIME = 7;
  it(`filters ${DEFAULT_INVOICES_FOR_ALL_TIME} invoices for all time`, async () => {
    await modal.switchToDefaultFilterTab();
    await modal.setPeriod('allTime');
    await modal.submit();

    await page.expectNumberOfGridRows(DEFAULT_INVOICES_FOR_ALL_TIME);
  });

  it('filters by reference should return a single result', async () => {
    const NUM_MATCHING = 1;

    await modal.setReference('IV.TPA.2');
    await modal.submit();

    await page.expectNumberOfGridRows(NUM_MATCHING);
  });

  it('filtering by a patient reference should get no results', async () => {
    const NUM_MATCHING = 0;

    await modal.setPatientReference('PA.TPA.0');
    await modal.submit();

    await page.expectNumberOfGridRows(NUM_MATCHING);
  });

  it('filters by service "Administration" to get three results', async () => {
    const NUM_MATCHING = 3;

    await components.serviceSelect.set('Administration');
    await modal.submit();

    await page.expectNumberOfGridRows(NUM_MATCHING);
  });

  const DEBTOR_GROUP_INVOICES = 0;
  it(`filters by debtor group "NGO IMA World Health" to get ${DEBTOR_GROUP_INVOICES} results`, async () => {
    await components.debtorGroupSelect.set('NGO IMA World Health');
    await modal.submit();

    await page.expectNumberOfGridRows(DEBTOR_GROUP_INVOICES);
  });


  const SUPER_USER_INVOICES = 7;
  it(`filters by user "Super User" should return ${SUPER_USER_INVOICES} results`, async () => {
    await modal.setUser('Super User');
    await modal.submit();

    await page.expectNumberOfGridRows(SUPER_USER_INVOICES);
  });
}

module.exports = InvoiceRegistrySearch;
