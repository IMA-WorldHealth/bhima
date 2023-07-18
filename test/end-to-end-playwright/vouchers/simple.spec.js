const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../shared/TestUtils');
const { by } = require('../shared/TestUtils');

const components = require('../shared/components');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

test.describe('Simple Vouchers', () => {

  test.beforeEach(async () => {
    await TU.navigate('/#/vouchers/simple');
  });

  /*
   * TODO - why does this not work on midnight JAN 1 2017?
  var yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  */

  const voucher = {
    date : new Date(),
    type : 'Transfer of the funds Auxiliary cashbox',
    toAccount : 'NGO', //  41111011 - NGO
    fromAccount : '57110011', // 57110011 - Caisse Auxiliaire CDF
    description : 'Awesome description',
    amount : 100.12,
  };

  test('can create a simple voucher', async () => {
    // configure the date to yesterday
    await components.dateEditor.set(voucher.date);

    await TU.input('SimpleVoucherCtrl.Voucher.details.description', voucher.description);
    await TU.uiSelect('SimpleVoucherCtrl.Voucher.details.type_id', voucher.type);

    // select the appropriate accounts
    await components.accountSelect.set(voucher.fromAccount, 'fromAccount');
    await components.accountSelect.set(voucher.toAccount, 'toAccount');

    await components.currencySelect.set(2);
    await components.currencyInput.set(voucher.amount);

    // submit the form
    await TU.buttons.submit();

    // make sure a receipt is displayed
    await TU.waitForSelector(by.id('receipt-confirm-created'));

    // close the modal
    await TU.modal.close();
  });
});
