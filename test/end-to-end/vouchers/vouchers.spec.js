const helpers = require('../shared/helpers');
const GU = require('../shared/GridUtils');
const FU = require('../shared/FormUtils');
const VoucherRegistrySearch = require('./vouchers.search');
const GridRow = require('../shared/GridRow');
const components = require('../shared/components');

describe('Voucher Registry', () => {
  const NUM_VOUCHERS = 17;
  const gridId = 'voucher-grid';

  before(() => helpers.navigate('vouchers'));

  it(`displays ${NUM_VOUCHERS} vouchers on the page`, async () => {
    await GU.expectRowCount(gridId, NUM_VOUCHERS);
  });

  describe('Search', VoucherRegistrySearch);

  it('deletes a record from the voucher registry', async () => {
    const row = new GridRow('VO.TPA.1');
    await row.dropdown().click();
    await row.remove().click();

    // accept the confirm modal
    await FU.modal.submit();

    await components.notification.hasSuccess();
  });
});
