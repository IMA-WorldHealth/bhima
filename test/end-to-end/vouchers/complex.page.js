/* global browser, element, by */
'use strict';

const chai = require('chai');
const expect = chai.expect;
const helpers = require('../shared/helpers');
helpers.configure(chai);

const components = require('../shared/components');
const FU = require('../shared/FormUtils');
const GU = require('../shared/GridUtils');

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

     // store a reference of the row 
     this._node = GU.getRow('voucherGridId', index);
   }

   // account setter
   account(number) {
    FU.uiSelectAppended('row.entity.account', number, this._node);
   }

   // sets the debit value
   debit(number) {
     FU.input('row.entity.debit', number, this._node);
   }

   // sets the credit value
   credit(number) {
     FU.input('row.entity.credit', number, this._node);
   }

   // sets the entity
   entity(type, name) {
     // click the 'open entity modal' button
     this._node.$('[data-entity-button]').click();

     // the modal is now open

     // select the proper entity type (Debtor/Creditor)
     FU.dropdown('[data-dropdown-target="entity"]', type);

     // select the typeahead
     FU.uiSelect('$ctrl.entity', name);

     // click the 'submit' button
     $('[data-modal="entity"]').$('[data-method="submit"]').click();
   }

   // sets the reference
   reference(type, index) {
     // click the 'open reference modal' button
     this._node.$('[data-reference-button]').click();

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

  // set the transfer type
  transferType(id) {
    element(by.model('ComplexVoucherCtrl.voucher.type_id')).click();
    element(by.css(`[data-item="${id}"]`)).click();
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
