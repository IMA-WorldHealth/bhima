/* global element, by */

const FU = require('../../shared/FormUtils');
const GU = require('../../shared/GridUtils');

const findPatient = require('../../shared/components/bhFindPatient');
const dateEditor = require('../../shared/components/bhDateEditor');
const addItem = require('../../shared/components/bhAddItem');

function PatientInvoicePage() {
  const page = this;

  const btns = {
    submit  : element(by.id('btn-submit-invoice')),
    add     : element(by.id('btn-add-rows')),
    clear   : element(by.id('clear')),
    recover : element(by.id('recover')),
  };

  const gridId = 'invoice-grid';
  page.gridId = gridId;

  // sets a patient to the id passed in
  page.patient = async function patient(id) {
    await findPatient.findById(id);
  };

  // sets a default patient, service, date, and note
  page.prepare = async function prepare() {
    // set a patient with id TPA1
    await findPatient.findById('PA.TPA.1');

    // set the date to the start of this day
    await dateEditor.set(new Date());

    // set a test description
    await FU.input(
      'PatientInvoiceCtrl.Invoice.details.description',
      'This is a temporary description.  It can be pretty long.'
    );

    // select the first enabled service in the list
    await FU.select('PatientInvoiceCtrl.Invoice.details.service_uuid', 'Administration');
  };

  // this exposes the ability to set the service at any time
  page.service = function service(name) {
    return FU.select('PatientInvoiceCtrl.Invoice.details.service_uuid', name);
  };

  // try to click the submit button
  page.submit = function submit() {
    return btns.submit.click();
  };

  // click the "recover cache" button
  page.recover = function recover() {
    return btns.recover.click();
  };

  // adds n rows to the grid
  page.addRows = async function addRows(n) {
    await addItem.set(n);
  };

  // returns n rows
  page.getRows = function getRows() {
    return GU.getRows(gridId);
  };

  // expect row count to be equal to a number
  page.expectRowCount = async function expectRowCount(n) {
    await GU.expectRowCount(gridId, n);
  };

  // add an inventory item to the grid
  page.addInventoryItem = async function addInvoiceItem(rowNumber, itemLabel) {
    // first column of the nth row
    const itemCell = await GU.getCell(gridId, rowNumber, 1);

    // enter data into the typeahead input.  We cannot use FU.typeahead because it is appended to the body.
    await FU.input('row.entity.inventory_uuid', itemLabel, itemCell);

    // the typeahead should be open - use an id to click the right item
    await element(by.id(`inv-code-${itemLabel}`)).click();
  };

  /**
   * adjustItemPrice
   *
   * This function adjusts the price of the item in row {rowNumber}.
   *
   * @param {Number} rowNumber - the grid's row number to adjust
   * @param {Number} price - the new transaction price to set
   */
  page.adjustItemPrice = async function adjustItemPrice(rowNumber, price) {
    // fourth column of the last nth row
    const priceCell = await GU.getCell(gridId, rowNumber, 4);
    await FU.input('row.entity.transaction_price', price, priceCell);
  };

  /**
   * adjustItemQuantity
   *
   * This function adjusts the quantity of the item in row {rowNumber}.
   *
   * @param {Number} rowNumber - the grid's row number to adjust
   * @param {Number} quantity - the number of items expected to have
   */
  page.adjustItemQuantity = async function adjustItemQuantity(rowNumber, quantity) {
    // third column column of the nth row
    const quantityCell = await GU.getCell(gridId, rowNumber, 3);
    await FU.input('row.entity.quantity', quantity, quantityCell);
  };

  // click the reset modal button
  page.reset = function reset() {
    return $('[data-action="close"]').click();
  };

  // bind the buttons for external use
  page.btns = btns;
}

// expose to the world!
module.exports = PatientInvoicePage;
