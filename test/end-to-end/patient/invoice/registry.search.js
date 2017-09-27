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

  it('filters 3 invoice for today', () => {
    const DEFAULT_INVOICES_FOR_TODAY = 3;

    modal.switchToDefaultFilterTab();
    modal.setPeriod('today');
    modal.submit();

    page.expectNumberOfGridRows(DEFAULT_INVOICES_FOR_TODAY);
  });

  it('filters 5 invoices for all time', () => {
    const DEFAULT_INVOICES_FOR_ALL_TIME = 5;

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

    modal.setService('Administration');
    modal.submit();

    page.expectNumberOfGridRows(NUM_MATCHING);
  });

  it('filters by debtor group "First Test Debtor Group" to get five results', () => {
    const NUM_MATCHING = 5;

    components.debtorGroupSelect.set('First Test Debtor Group');
    modal.submit();

    page.expectNumberOfGridRows(NUM_MATCHING);
  });


  it('filters by user "Super User" should return five results', () => {
    const NUM_MATCHING = 5;

    modal.setUser('Super User');
    modal.submit();

    page.expectNumberOfGridRows(NUM_MATCHING);
  });
}

module.exports = InvoiceRegistrySearch;
