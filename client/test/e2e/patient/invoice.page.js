/* global element, by, beforeEach, inject, browser */

var FU = require('../shared/FormUtils');
var GU = require('../shared/gridTestUtils.spec.js');
var findPatient = require('../shared/components/bhFindPatient');
var dateEditor = require('../shared/components/bhDateEditor');

function PatientInvoicePage() {
  var page = this;

  var btns = {
    submit : element(by.id('btn-submit-invoice')),
    add : element(by.id('btn-add-rows')),
    distributable : element(by.id('distributable')),
    notDistributable : element(by.id('not-distributable')),
    clear : element(by.id('clear'))
  };

  var gridId = page.gridId = 'invoice-grid';
  var grid = GU.getGrid(gridId);

  // sets a patient to the id passed in
  page.patient = function patient(id) {
    findPatient.findById(id);
  };

  // sets a default patient, service, date, and note
  page.prepare = function prepare() {

    // set a patient with id TPA1
    findPatient.findById('TPA1');

    // set the date to the start of this year
    dateEditor.set(new Date('2016-01-01'));

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

    // first column of the last row
    var itemCell = GU.dataCell(gridId, rowNumber, 1);

    // get the typeahead input
    var input = itemCell.element(by.model('row.entity.inventory_uuid'));

    // make sure that it is all clear
    input.clear();

    // send the inventory item label
    input.sendKeys(itemLabel);

    // the typeahead should be open - use an id to click the right item
    element(by.id('inv-code-?'.replace('?', itemLabel))).click();
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

    // first column of the last row
    var priceCell = GU.dataCell(gridId, rowNumber, 4);

    // locate the price input
    var input = priceCell.element(by.model('row.entity.transaction_price'));

    // clear the input
    input.clear();

    // adjust the price
    input.sendKeys(price);
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

    // third column column of the n-th row
    var quantityCell = GU.dataCell(gridId, rowNumber, 3);

    // locate the quantity input
    var input = quantityCell.element(by.model('row.entity.quantity'));

    // clear the input
    input.clear();

    // adjust the quantity
    input.sendKeys(quantity);
  };

  // bind the buttons for external use
  page.btns = btns;
}

// expose to the world!
module.exports = PatientInvoicePage;
