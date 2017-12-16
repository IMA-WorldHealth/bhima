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

  it('can create a simple voucher', () => {
    // configure the date to yesterday
    components.dateEditor.set(voucher.date);

    FU.input('SimpleVoucherCtrl.Voucher.details.description', voucher.description);
    FU.uiSelect('SimpleVoucherCtrl.Voucher.details.type_id', voucher.type);

    // select the appropriate accounts
    components.accountSelect.set(voucher.fromAccount, 'fromAccount');
    components.accountSelect.set(voucher.toAccount, 'toAccount');

    components.currencySelect.set(2);
    components.currencyInput.set(voucher.amount);

    // submit the form
    FU.buttons.submit();

    // make sure a receipt is displayed
    FU.exists(by.id('receipt-confirm-created'), true);

    // close the modal
    FU.modal.close();
  });
});
