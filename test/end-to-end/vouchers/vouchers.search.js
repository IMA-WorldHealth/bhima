const GU = require('../shared/GridUtils');

const SearchModal = require('../shared/search.page');
const Filters = require('../shared/components/bhFilters');

module.exports = VoucherRegistrySearch;

function VoucherRegistrySearch() {
  const gridId = 'voucher-grid';
  const NUM_VOUCHERS = 13;
  const NUM_USER_RECORDS = 12;
  const NUM_DESCRIPTION_RECORDS = 1;
  const NUM_TRANSACTION_TYPE_RECORD = 1;
  const transactionTypes = ['Autres Depenses'];

  let modal;
  let filters;

  beforeEach(async () => {
    await SearchModal.open();
    modal = new SearchModal('voucher-search');
    filters = new Filters();
  });

  afterEach(async () => {
    await filters.resetFilters();
  });

  async function expectNumberOfGridRows(number) {
    await GU.expectRowCount(gridId, number, `Expected VoucherRegistry's ui-grid row count to be ${number}.`);
  }

  it('filters vouchers by clicking the month button', async () => {
    await modal.switchToDefaultFilterTab();
    // set the filters to month
    await modal.setPeriod('month');
    await modal.submit();

    await expectNumberOfGridRows(NUM_VOUCHERS - 1);
  });

  it('filters by reference should return a single result', async () => {
    await modal.setReference('VO.TPA.2');
    await modal.submit();
    await expectNumberOfGridRows(1);
  });

  it(`filters by <select> should return ${NUM_USER_RECORDS} results`, async () => {
    await modal.setUser('Super User');
    await modal.submit();
    await expectNumberOfGridRows(NUM_USER_RECORDS);
  });

  it(`filters by <select> transaction type should return ${NUM_TRANSACTION_TYPE_RECORD} results`, async () => {
    await modal.setTransactionType(transactionTypes);
    await modal.submit();
    await expectNumberOfGridRows(NUM_TRANSACTION_TYPE_RECORD);
  });

  it(`filtering by description should return ${NUM_DESCRIPTION_RECORDS} results`, async () => {
    await modal.setDescription('CORRECTION');
    await modal.submit();

    await expectNumberOfGridRows(NUM_DESCRIPTION_RECORDS);
  });
}
