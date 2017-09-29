'use strict';

/* global element, by, browser */

const chai = require('chai');
const helpers = require('../shared/helpers');

const GU = require('../shared/GridUtils');
const FU = require('../shared/FormUtils');

const components = require('../shared/components');
const SearchModal = require('../shared/search.page');
const Filters = require('../shared/components/bhFilters');

helpers.configure(chai);
const expect = chai.expect;

module.exports = VoucherRegistrySearch;

function VoucherRegistrySearch() {
  const gridId = 'voucher-grid';
  const NUM_VOUCHERS = 16;
  const NUM_USER_RECORDS = 16;
  const NUM_DESCRIPTION_RECORDS = 2;
  const NUM_TRANSACTION_TYPE_RECORD = 1;
  const transactionTypes = ['Autres Depenses']

  let modal;
  let filters;

  beforeEach(() => {
    SearchModal.open();
    modal = new SearchModal('voucher-search');
    filters = new Filters();
  });

  afterEach(() => {
    filters.resetFilters();
  });

  function expectNumberOfGridRows(number) {
    GU.expectRowCount(gridId, number, `Expected VoucherRegistry's ui-grid row count to be ${number}.`);
  }

  it('filters vouchers by clicking the month button', () => {
    modal.switchToDefaultFilterTab();
    // set the filters to month    
    modal.setPeriod('month');
    modal.submit();

    expectNumberOfGridRows(NUM_VOUCHERS);
  });

  it('filters by reference should return a single result', () => {
    modal.setReference('VO.TPA.2');
    modal.submit();
    expectNumberOfGridRows(1);
  });

  it(`filters by <select> should return ${NUM_USER_RECORDS} results`, () => {
    modal.setUser('Super User');
    modal.submit();
    expectNumberOfGridRows(NUM_VOUCHERS);
  });

  it(`filters by <select> transaction type should return ${NUM_TRANSACTION_TYPE_RECORD} results`, () => {
    modal.setTransactionType(transactionTypes);
    modal.submit();
    expectNumberOfGridRows(NUM_TRANSACTION_TYPE_RECORD);
  });

  it(`filtering by description should return ${NUM_DESCRIPTION_RECORDS} results`, () => {
    modal.setDescription('REVERSAL');
    modal.submit();

    expectNumberOfGridRows(NUM_DESCRIPTION_RECORDS);
  });
}
