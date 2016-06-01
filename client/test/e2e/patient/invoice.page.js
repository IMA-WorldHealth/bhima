/* global element, by, browser */

'use strict';

const FU = require('../shared/FormUtils');
const GU = require('../shared/gridTestUtils.spec.js');
const findPatient = require('../shared/components/bhFindPatient');
const dateEditor = require('../shared/components/bhDateEditor');

function PatientInvoicePage() {
  const page = this;

  const btns = {
    submit : element(by.id('btn-submit-invoice')),
    add : element(by.id('btn-add-rows')),
    distributable : element(by.id('distributable')),
    notDistributable : element(by.id('not-distributable')),
    clear : element(by.id('clear'))
  };

  const gridId = page.gridId = 'invoice-grid';
  const grid = GU.getGrid(gridId);

  // sets a patient to the id passed in
  page.patient = function patient(id) {
    findPatient.findById(id);
  };

  // sets a default patient, service, date, and note
  page.prepare = function prepare() {

    // set a patient with id TPA1
    findPatient.findById('TPA1');

    // set the date to the start of this year
    dateEditor.set(new Date('2016-01-02'));

    // set a test description
    FU.input(
      'PatientInvoiceCtrl.Invoice.details.description',
      'This is a temporary description.  It can be pretty long.'
    );

    // set this invoice to be distributable
    btns.distributable.click();

    // select the first enabled service in the list
    FU.select('PatientInvoiceCtrl.Invoice.details.service_id', 'Administration');
  };

  // try to click the submit button
  page.submit = function submit() {
    btns.submit.click();
  };

  // adds n rows to the grid
  page.addRows = function addRows(n) {
    FU.input('PatientInvoiceCtrl.itemIncrement', n);
    btns.add.click();
  };

  // returns n rows
  page.getRows = function getRows() {
    var rows = grid.element(by.css('.ui-grid-render-container-body'))
        .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'));
    return rows;
  };

  // add an inventory item to the grid
  page.addInventoryItem = function addInvoiceItem(rowNumber, itemLabel) {

    // first column of the nth row
    const itemCell = GU.dataCell(gridId, rowNumber, 1);

    // enter data into the typeahead input.  We cannot use FU.typeahead because it is appended to the body.
    FU.input('row.entity.inventory_uuid', itemLabel, itemCell);

    // the typeahead should be open - use an id to click the right item
    element(by.id(`inv-code-${itemLabel}`)).click();
  };

  /**
   * adjustItemPrice
   *
   * This function adjusts the price of the item in row {rowNumber}.
   *
   * @param {Number} rowNumber - the grid's row number to adjust
   * @param {Number} price - the new transaction price to set
   */
  page.adjustItemPrice = function adjustItemPrice(rowNumber, price) {

    // fourth column of the last nth row
    const priceCell = GU.dataCell(gridId, rowNumber, 4);
    FU.input('row.entity.transaction_price', price, priceCell);
  };

  /**
   * adjustItemQuantity
   *
   * This function adjusts the quantity of the item in row {rowNumber}.
   *
   * @param {Number} rowNumber - the grid's row number to adjust
   * @param {Number} quantity - the number of items expected to have
   */
  page.adjustItemQuantity = function adjustItemQuantity(rowNumber, quantity) {

    // third column column of the nth row
    const quantityCell = GU.dataCell(gridId, rowNumber, 3);
    FU.input('row.entity.quantity', quantity, quantityCell);
  };

  // click the reset modal button
  page.reset = function reset() {
    $('[data-action="close"]').click();
  };

  // bind the buttons for external use
  page.btns = btns;
}

// expose to the world!
module.exports = PatientInvoicePage;
