/* global browser, element, by */
'use strict';

const helpers = require('../shared/helpers');
const components = require('../shared/components');
const ComplexVoucherPage = require('./complex.page');

describe('Complex Vouchers', function () {

  before(() => helpers.navigate('vouchers/complex'));

  it('creates a complex voucher', function () {
    const page = new ComplexVoucherPage();

    // the voucher we will use in this page
    const voucher = {
      date : new Date(),
      description : 'Complex voucher test e2e',
      rows : [
        { account : 'Test Debtor Accounts1', debit: 18, credit: 0, entity : { type : 'D', name: 'Patient/2/Patient' }},
        { account : 'Test Capital One', debit: 0, credit: 8, reference : { type : 'voucher', index : 0 }},
        { account : 'Test Capital Two', debit: 0, credit: 5, reference : { type : 'voucher', index : 2 }},
        { account : 'Test Balance Accounts', debit: 0, credit: 5, reference : { type : 'voucher', index : 1 }}
      ]
    };

    // configure the date to today
    page.date(voucher.date);

    // set the description
    page.description(voucher.description);

    // set the currency to USD
    page.currency(2);

    // add two rows
    page.addRow();
    page.addRow();

    // loop through each row and assign the correct form values
    voucher.rows.forEach((row, idx) => {
      let current = page.row(idx);
      current.account(row.account);
      current.debit(row.debit);
      current.credit(row.credit);
      if (row.entity) {
        current.entity(row.entity.type, row.entity.name);
      }
      if (row.reference) {
        current.reference(row.reference.type, row.reference.index);
      }
    });

    // submit the page
    page.submit();

    // expect a successful notification
    components.notification.hasSuccess();
  });
});
