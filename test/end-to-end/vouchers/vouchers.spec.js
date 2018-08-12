const helpers = require('../shared/helpers');
const GU = require('../shared/GridUtils');
const FU = require('../shared/FormUtils');
const VoucherRegistrySearch = require('./vouchers.search');
const GridRow = require('../shared/GridRow');
const components = require('../shared/components');

describe('Voucher Registry', () => {
  const NUM_VOUCHERS = 23;
  const gridId = 'voucher-grid';

  before(() => helpers.navigate('vouchers'));

  it(`displays Above ${NUM_VOUCHERS} vouchers on the page`, () => {
    GU.expectRowCountAbove(gridId, NUM_VOUCHERS);
  });

  describe('Search', VoucherRegistrySearch);

  it(`deletes a record from the voucher registry`, () => {
    const row = new GridRow('VO.TPA.1');
    row.dropdown().click();
    row.remove().click();

    // accept the confirm modal
    FU.modal.submit();

    components.notification.hasSuccess();
  });
});
