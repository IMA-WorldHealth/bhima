'use strict';

/* global browser, element, by */
const helpers = require('../shared/helpers');
const GU = require('../shared/GridUtils');
const VoucherRegistrySearch = require('./vouchers.search');

describe('Voucher Registry', function () {
  const numVouchers = 12;
  const gridId = 'voucher-grid';

  before(() => helpers.navigate('vouchers'));

  it(`displays ${numVouchers} vouchers on the page`, () => {
    GU.expectRowCount(gridId, numVouchers);
  });

  describe('Search', VoucherRegistrySearch);
});
