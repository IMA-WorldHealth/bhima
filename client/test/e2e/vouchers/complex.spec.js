/* global browser, element, by */
'use strict';

const chai = require('chai');
const expect = chai.expect;
const helpers = require('../shared/helpers');
helpers.configure(chai);

const components = require('../shared/components');
const FU = require('../shared/FormUtils');
const ComplexVoucherPage = require('./complex.page');

describe.only('Complex Vouchers', function () {

  before(() => helpers.navigate('vouchers/complex'));

  it('creates a complex voucher', function () {
    const page = new ComplexVoucherPage();

    // the voucher we will use in this page
    const voucher = {
      date : new Date(),
      description : 'Complex voucher test e2e',
      rows : [
        { account : 'Test Debtor', debit: 17, credit: 0, entity : { type : 'D', name: 'Patient/2/Patient' }},
        { account : 'Test Capital One', debit: 0, credit: 7, },
        { account : 'Test Capital Two', debit: 0, credit: 5 },
        { account : 'Test Balance', debit: 0, credit: 5 }
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
