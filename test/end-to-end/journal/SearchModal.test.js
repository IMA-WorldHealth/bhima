const helpers = require('../shared/helpers');

const Filters = require('../shared/components/bhFilters');
const SearchModal = require('./SearchModal.page');
const JournalPage = require('./journal.page');

function JournalSearchTests() {
  const path = '#!/journal';
  const NUM_UNPOSTED_ROWS = 14;
  const page = new JournalPage();

  before(() => helpers.navigate(path));

  let modal;
  let filters;

  beforeEach(() => {
    SearchModal.open();
    modal = new SearchModal();
    filters = new Filters();
  });

  afterEach(() => {
    filters.resetFilters();
  });

  it(`loads at least ${NUM_UNPOSTED_ROWS} unposted rows from the database`, () => {
    modal.close();
    page.expectRowCountAbove(NUM_UNPOSTED_ROWS);
  });

  const NUM_ACCOUNT_CHURCH = 4;
  it(`should have ${NUM_ACCOUNT_CHURCH} rows for the church account`, () => {
    modal.setAccount('41111010');
    modal.submit();
  });

  const PATIENT_REFERENCE = 'PA.TPA.2';
  const NUMBER_OF_REFERENCED_LINES = 4;
  it(`finds ${NUMBER_OF_REFERENCED_LINES} rows for patient reference ${PATIENT_REFERENCE}`, () => {
    modal.setEntity(PATIENT_REFERENCE);
    modal.submit();
    page.expectRowCount(NUMBER_OF_REFERENCED_LINES);
  });

  const TOTAL_TRANSACTION_LINES_REFERENCED = 8;
  it('shows more rows when "showFullTransaction" option is set', () => {
    modal.setEntity(PATIENT_REFERENCE);
    modal.showFullTransactions(true);
    modal.submit();
    page.expectRowCount(TOTAL_TRANSACTION_LINES_REFERENCED);
  });

  const NUM_TXN_TYPE_TRANSFER = 2;
  const TXN_TYPE = 'Transfer';
  it(`finds ${NUM_TXN_TYPE_TRANSFER} rows for transfer transaction type`, () => {
    modal.setTransactionType([TXN_TYPE]);
    modal.submit();
    page.expectRowCount(NUM_TXN_TYPE_TRANSFER);
  });

  const NUM_CASH_ROWS = 2;
  const CASH_RECORD = 'CP.TPA.1';
  it(`finds ${NUM_CASH_ROWS} rows for record ${CASH_RECORD}`, () => {
    modal.setRecord(CASH_RECORD);
    modal.submit();
    page.expectRowCount(NUM_CASH_ROWS);
  });

  const NUM_REFERENCED_ROWS = 4;
  const INVOICE_REFERENCE = 'IV.TPA.1';
  it(`finds ${NUM_REFERENCED_ROWS} rows for reference ${INVOICE_REFERENCE}`, () => {
    modal.setReference(INVOICE_REFERENCE);
    modal.submit();
    page.expectRowCount(NUM_REFERENCED_ROWS);
  });
}

module.exports = JournalSearchTests;
