const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../shared/TestUtils');

const GU = require('../shared/GridUtils');
const VoucherRegistrySearch = require('./vouchers.search');
const GridRow = require('../shared/GridRow');
const components = require('../shared/components');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

test.describe('Voucher Registry', () => {
  const NUM_VOUCHERS = [4, 11];
  const gridId = 'voucher-grid';

  test.beforeEach(async () => {
    await TU.navigate('/#/vouchers');
  });

  test(`displays ${NUM_VOUCHERS} vouchers on the page`, async () => {
    await TU.waitForSelector('.ui-grid-canvas .ui-grid-row');
    await GU.expectRowCount(gridId, NUM_VOUCHERS);
  });

  test.describe('Search', VoucherRegistrySearch);

  test('deletes a record from the voucher registry', async () => {
    const row = new GridRow('VO.TPA.1');
    await row.dropdown();
    await row.remove();

    await TU.modal.submit();

    await components.notification.hasSuccess();
  });
});
