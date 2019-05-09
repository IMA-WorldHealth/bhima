/* global by */
const components = require('../shared/components');
const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');

describe('Simple Vouchers', () => {
  before(() => helpers.navigate('#/vouchers/simple'));

  /*
   * TODO - why does this not work on midnight JAN 1 2017?
  var yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  */

  const voucher = {
    date : new Date(),
    type : 'Transfer',
    toAccount : 'NGO',
    fromAccount : '57110011', // 57110011 - Caisse Auxiliaire CDF
    description : 'Awesome description',
    amount : 100.12,
  };

  it('can create a simple voucher', async () => {
    // configure the date to yesterday
    await components.dateEditor.set(voucher.date);

    await FU.input('SimpleVoucherCtrl.Voucher.details.description', voucher.description);
    await FU.uiSelect('SimpleVoucherCtrl.Voucher.details.type_id', voucher.type);

    // select the appropriate accounts
    await components.accountSelect.set(voucher.fromAccount, 'fromAccount');
    await components.accountSelect.set(voucher.toAccount, 'toAccount');

    await components.currencySelect.set(2);
    await components.currencyInput.set(voucher.amount);

    // submit the form
    await FU.buttons.submit();

    // make sure a receipt is displayed
    await FU.exists(by.id('receipt-confirm-created'), true);

    // close the modal
    await FU.modal.close();
  });
});
