/* global browser, element, by */
'use strict';

const chai = require('chai');
const expect = chai.expect;
const helpers = require('../shared/helpers');
helpers.configure(chai);

const components = require('../shared/components');
const FU = require('../shared/FormUtils');
const GU = require('../shared/gridTestUtils.spec.js');

/**
 * @class Row
 *
 * @description
 * Models a single row on the Complex Journal Voucher Grid.  This should ease the
 * creation of end to end tests.
 *
 * @requires components
 * @requires FormUtils
 */
class Row {
  constructor(index) {

    // store a reference to the <tr> dom element
    this._node = $(`[data-row="${index}"]`);

    // selectors for buttons/inputs in the row
    this._selectors = {
      account: '[data-account-input]',
      credit: '[data-credit-input]',
      debit: '[data-debit-input]',
      entity: '[data-entity-button]',
      reference: '[data-reference-button]'
    };
  }

  // inputs the number in to the <input> matched by the selector
  _input(selector, number) {
    let input = this._node.$(selector);
    input.clear();
    input.sendKeys(number);
  }

  // account setter
  account(number) {
    this._input(this._selectors.account, number);

    // click the first matching option in the list
    let option = element.all(by.repeater('match in matches track by $index')).first();
    option.click();
  }

  // sets the debit value
  debit(number) {
    this._input(this._selectors.debit, number);
  }

  // sets the credit value
  credit(number) {
    this._input(this._selectors.credit, number);
  }

  // sets the entity
  entity(type, name) {
    // click the 'open entity modal' button
    this._node.$(this._selectors.entity).click();

    // the modal is now open

    // select the proper entity type (Debtor/Creditor)
    FU.dropdown('[data-dropdown-target="entity"]', type);

    // select the typeahead
    FU.typeahead('$ctrl.entity', name);

    // click the 'submit' button
    $('[data-modal="entity"]').$('[data-method="submit"]').click();
  }

  // sets the reference
  reference(type, index) {
    // click the 'open reference modal' button
    this._node.$(this._selectors.reference).click();

    // select the type
    // supported : 'voucher', 'cash-payment', 'patient-invoice'
    $(`[data-button-${type}]`).click();

    GU.selectRow('referenceGrid', index);

    // submit the modal
    $('[data-reference-modal]').$('[data-method="submit"]').click();
  }
}


/**
 * @class ComplexVoucherPage
 *
 * @description
 * A page object to wrap complex journal voucher logic into a simple page.  This
 * allows many tests to be performed with relatively little code written in the
 * tests.
 *
 * @requires components
 * @requires FormUtils
 */
class ComplexVoucherPage {

  // set up the page
  constructor() {

    // default to 2 because the page has two rows at startup
    this._rows = [ new Row(0), new Row(1) ];
  }

  // set the date input
  date(value) {
    components.dateEditor.set(value);
    return this;
  }

  // set the description field
  description(value) {
    FU.input('ComplexVoucherCtrl.voucher.description', value);
    return this;
  }

  // set the currency input
  currency(id) {
    $(`[data-currency-option="${id}"]`).click();
    return this;
  }

  // submit the form
  submit() {
    FU.buttons.submit();
    return this;
  }

  // add a row to the voucher
  addRow() {

    // click the add row button
    $('[data-button-add-item]').click();

    // create a new row reference to the last row
    let row = new Row(this._rows.length);

    // add the row to the array of rows
    this._rows.push(row);

    // return the row
    return this;
  }

  // remove a row at "index"
  removeRow(index) {
    this._rows.slice(index, 1);
  }

  // get all rows
  rows() {
    return this._rows;
  }

  // get a particular row at "index"
  row(index) {
    return this._rows[index];
  }
}


module.exports = ComplexVoucherPage;
