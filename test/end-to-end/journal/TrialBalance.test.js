const { expect } = require('chai');
const helpers = require('../shared/helpers');
const { notification } = require('../shared/components');

const TrialBalancePage = require('./TrialBalance.page.js');
const Filters = require('../shared/components/bhFilters');
const SearchModal = require('./SearchModal.page');
const JournalPage = require('./journal.page');

function TrialBalanceTest() {
  const page = new JournalPage();
  const TrialBalance = new TrialBalancePage();

  const path = '#!/journal';
  before(() => helpers.navigate(path));

  let filters;

  beforeEach(() => {
    filters = new Filters();
  });

  afterEach(() => {
    filters.resetFilters();
  });

  const TXN_A = 'TPA38'; // CP.TPA.3 (Paiement caution par Test 2 Patient (PA.TPA.2).)
  const TXN_B = 'TPA6'; // CP.TPA.2 (This will be deleted in tests)
  it(`posts mutiple transactions (${TXN_A}, ${TXN_B}) to the General Ledger`, () => {
    SearchModal.open();
    const modal = new SearchModal();
    modal.setTransactionType(['client']);
    modal.submit();

    page.selectTransaction(TXN_A);
    page.selectTransaction(TXN_B);

    page.openTrialBalanceModal();

    // should have four lines
    expect(TrialBalance.countOverviewRows()).to.eventually.equal(2);

    TrialBalance.submit();
  });

  const POSTED_TXN = 'TPA38';
  it(`blocks ${POSTED_TXN} as it is already posted`, () => {

    // make sure we have posted records in our view
    SearchModal.open();
    const modal = new SearchModal();
    modal.showPostedRecords(true);
    modal.submit();

    // select the posted transaction
    page.selectTransaction(POSTED_TXN);
    page.openTrialBalanceModal();

    notification.hasWarn();
  });
}

module.exports = TrialBalanceTest;
