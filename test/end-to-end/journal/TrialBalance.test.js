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

  afterEach(async () => {
    await filters.resetFilters();
  });

  const TXN_A = 'TPA38'; // CP.TPA.3 (Paiement caution par Test 2 Patient (PA.TPA.2).)
  const TXN_B = 'TPA6'; // CP.TPA.2 (This will be deleted in tests)
  it(`posts mutiple transactions (${TXN_A}, ${TXN_B}) to the General Ledger`, async () => {
    await SearchModal.open();
    const modal = new SearchModal();
    await modal.setTransactionType(['client']);
    await modal.submit();

    await page.selectTransaction(TXN_A);
    await page.selectTransaction(TXN_B);

    await page.openTrialBalanceModal();

    // should have four lines
    expect(await TrialBalance.countOverviewRows()).to.equal(2);

    await TrialBalance.submit();
  });

  const POSTED_TXN = 'TPA38';
  it(`blocks ${POSTED_TXN} as it is already posted`, async () => {

    // make sure we have posted records in our view
    await SearchModal.open();
    const modal = new SearchModal();
    await modal.showPostedRecords(true);
    await modal.submit();

    // select the posted transaction
    await page.selectTransaction(POSTED_TXN);
    await page.openTrialBalanceModal();

    await notification.hasWarn();
  });
}

module.exports = TrialBalanceTest;
