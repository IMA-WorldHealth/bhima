const Filters = require('../../shared/components/bhFilters');
const SearchModal = require('../../shared/search.page');
const components = require('../../shared/components');
const InvoiceRegistryPage = require('./registry.page.js');

function InvoiceRegistrySearch() {
  let modal;
  let filters;

  const page = new InvoiceRegistryPage();

  beforeEach(() => {
    SearchModal.open();
    modal = new SearchModal('invoice-search');
    filters = new Filters();
  });

  afterEach(() => {
    filters.resetFilters();
  });

  const DEFAULT_INVOICES_FOR_TODAY = 4;
  it(`filters ${DEFAULT_INVOICES_FOR_TODAY} invoice for today`, () => {
    modal.switchToDefaultFilterTab();
    modal.setPeriod('today');
    modal.submit();

    page.expectNumberOfGridRows(DEFAULT_INVOICES_FOR_TODAY);
  });

  const DEFAULT_INVOICES_FOR_ALL_TIME = 5;
  it(`filters ${DEFAULT_INVOICES_FOR_ALL_TIME} invoices for all time`, () => {
    modal.switchToDefaultFilterTab();
    modal.setPeriod('allTime');
    modal.submit();

    page.expectNumberOfGridRows(DEFAULT_INVOICES_FOR_ALL_TIME);
  });

  it('filters by reference should return a single result', () => {
    const NUM_MATCHING = 1;

    modal.setReference('IV.TPA.2');
    modal.submit();

    page.expectNumberOfGridRows(NUM_MATCHING);
  });

  it('filtering by a patient reference should get no results', () => {
    const NUM_MATCHING = 0;

    modal.setPatientReference('PA.TPA.0');
    modal.submit();

    page.expectNumberOfGridRows(NUM_MATCHING);
  });

  it('filters by service "Administration" to get three results', () => {
    const NUM_MATCHING = 3;

    components.serviceSelect.set('Administration');
    modal.submit();

    page.expectNumberOfGridRows(NUM_MATCHING);
  });

  const DEBTOR_GROUP_INVOICES = 0;
  it(`filters by debtor group "NGO IMA World Health" to get ${DEBTOR_GROUP_INVOICES} results`, () => {
    components.debtorGroupSelect.set('NGO IMA World Health');
    modal.submit();

    page.expectNumberOfGridRows(DEBTOR_GROUP_INVOICES);
  });


  const SUPER_USER_INVOICES = 5;
  it(`filters by user "Super User" should return ${SUPER_USER_INVOICES} results`, () => {
    modal.setUser('Super User');
    modal.submit();

    page.expectNumberOfGridRows(SUPER_USER_INVOICES);
  });
}

module.exports = InvoiceRegistrySearch;
