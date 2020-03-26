/* global  element, by */

// eslint-disable-next-line max-classes-per-file
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
 * @requires GridUtils
 */
class Row {
  constructor(index) {
    // store a reference of the row
    this._node = GU.getRow('voucherGridId', index);
  }

  // account setter
  account(number) {
    // 'row.entity.account_id'
    return FU.typeaheadAppended('$ctrl.account', number, this._node);
  }

  // sets the debit value
  debit(number) {
    return FU.input('row.entity.debit', number, this._node);
  }

  // sets the credit value
  credit(number) {
    return FU.input('row.entity.credit', number, this._node);
  }

  // sets the entity
  async entity(type, name) {
    // click the 'open entity modal' button
    await this._node.$('[data-entity-button]').click();

    // the modal is now open
    const modal = $('[uib-modal-window="modal-window"]');

    // select the proper entity type (Debtor/Creditor)
    await FU.dropdown('[data-dropdown-target="entity"]', type, modal);

    // select the typeahead
    await FU.typeahead('$ctrl.entity', name);

    // click the 'submit' button
    await FU.modal.submit();
  }

  // sets the reference
  async reference(type, index) {
    // click the 'open reference modal' button
    await this._node.$('[data-reference-button]').click();

    // select the type
    // supported : 'voucher', 'cash-payment', 'patient-invoice'
    await $(`[data-button-${type}]`).click();

    await GU.selectRow('referenceGrid', index);

    // submit the modal
    await FU.modal.submit();
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
    this._rows = [new Row(0), new Row(1)];
  }

  // set the date input
  async date(value) {
    await components.dateEditor.set(value);
    return this;
  }

  // set the description field
  async description(value) {
    await FU.input('ComplexVoucherCtrl.Voucher.details.description', value);
    return this;
  }

  // set the currency input
  async currency(id) {
    await $(`[data-currency-option="${id}"]`).click();
    return this;
  }

  // set the transfer type
  async transactionType(type) {
    await FU.uiSelect('ComplexVoucherCtrl.Voucher.details.type_id', type);
    return this;
  }

  // submit the form
  async submit() {
    await FU.buttons.submit();
    return this;
  }

  // add a row to the voucher
  async addRow() {
    // click the add row button
    await element(by.id('btn-add-rows')).click();

    // create a new row reference to the last row
    const row = new Row(this._rows.length);

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
