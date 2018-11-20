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

  const TXN_A = 'TPA12'; // VO.TPA.4 reversal
  const TXN_B = 'TPA8'; // VO.TPA.2 (fourth voucher from test dataste)
  it(`posts mutiple transactions (${TXN_A}, ${TXN_B}) to the General Ledger`, () => {
    page.selectTransaction(TXN_A);
    page.selectTransaction(TXN_B);

    page.openTrialBalanceModal();

    // should have four lines
    expect(TrialBalance.countOverviewRows()).to.eventually.equal(4);

    TrialBalance.submit();
  });

  const POSTED_TXN = 'TPA8';
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
