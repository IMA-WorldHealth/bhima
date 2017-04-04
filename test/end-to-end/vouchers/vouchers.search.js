'use strict';

/* global element, by, browser */

const chai = require('chai');
const helpers = require('../shared/helpers');

const GU = require('../shared/GridUtils');
const FU = require('../shared/FormUtils');

const components = require('../shared/components');

helpers.configure(chai);
const expect = chai.expect;

module.exports = VoucherRegistrySearch;

function VoucherRegistrySearch() {
  const gridId = 'voucher-grid';
  const NUM_VOUCHERS = 9;
  const NUM_USER_RECORDS = 9;
  const NUM_DESCRIPTION_RECORDS = 2;

  function expectNumberOfGridRows(number) {
    GU.expectRowCount(gridId, number, `Expected VoucherRegistry's ui-grid row count to be ${number}.`);
  }

  function expectNumberOfFilters(number) {
    const filters = $('[data-bh-filter-bar]').all(by.css('.label'));
    expect(filters.count(),
      `Expected Invoice Registry bh-filter-bar's filter count to be ${number}.`
    ).to.eventually.equal(number);
  }

  it('filters vouchers by clicking the month button', () => {
    // set the filters to month
    FU.buttons.search();
    $('[data-date-range="month"]').click();
    FU.modal.submit();

    expectNumberOfGridRows(NUM_VOUCHERS);
    expectNumberOfFilters(2);

    // make sure to clear the filters for the next test
    FU.buttons.clear();
  });

  it('filters by reference should return a single result', () => {
    FU.buttons.search();
    FU.input('ModalCtrl.params.reference', 'VO.TPA.2');
    FU.modal.submit();

    expectNumberOfGridRows(1);
    expectNumberOfFilters(1);

    // make sure to clear the filters for the next test
    FU.buttons.clear();
  });

  it(`filters by <select> should return ${NUM_USER_RECORDS} results`, () => {
    FU.buttons.search();
    FU.select('ModalCtrl.params.user_id', 'Super User');
    FU.modal.submit();

    expectNumberOfGridRows(NUM_VOUCHERS);
    expectNumberOfFilters(1);

    // make sure to clear the filters for the next test
    FU.buttons.clear();
  });

  it(`filtering by description should return ${NUM_DESCRIPTION_RECORDS} results`, () => {
    FU.buttons.search();
    FU.input('ModalCtrl.params.description', 'REVERSAL');
    FU.modal.submit();

    expectNumberOfGridRows(NUM_DESCRIPTION_RECORDS);
    expectNumberOfFilters(1);

    // make sure to clear the filters for the next test
    FU.buttons.clear();
  });

  it('clear filters should remove all filters on the registry', () => {
    FU.buttons.search();
    FU.input('ModalCtrl.params.reference', 'VO.TPA.2');
    FU.modal.submit();

    expectNumberOfGridRows(1);
    expectNumberOfFilters(1);

    FU.buttons.clear();

    expectNumberOfGridRows(NUM_VOUCHERS);
    expectNumberOfFilters(1);
  });
}
