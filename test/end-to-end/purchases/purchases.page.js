/* global element, by */

const FU = require('../shared/FormUtils');
const GU = require('../shared/GridUtils.js');
const addItem = require('../shared/components/bhAddItem');

function PurchaseOrderPage() {
  const page = this;

  const btns = {
    submit : $('[data-method="submit"]'),
    add : element(by.id('btn-add-rows')),
    clear : $('[data-method="clear"]'),
  };

  const gridId = 'purchase-order-grid';
  page.gridId = gridId;
  const grid = GU.getGrid(gridId);

  // try to click the submit button
  page.submit = function submit() {
    return btns.submit.click();
  };

  // adds n rows to the grid
  page.addRows = function addRows(n) {
    return addItem.set(n);
  };

  // try to click the submit button 'Optimal Purchase Order'
  page.optimalPurchase = async function optimalPurchase() {
    await element(by.id(`optimal_purchase`)).click();
  };

  // returns n rows
  page.getRows = function getRows() {
    return grid.element(by.css('.ui-grid-render-container-body'))
      .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'));
  };

  // add an inventory item to the grid
  page.addInventoryItem = async function addInvoiceItem(rowNumber, code) {

    // first column of the nth row
    const itemCell = await GU.getCell(gridId, rowNumber, 1);

    // enter data into the typeahead input.  We cannot use FU.typeahead because it is appended to the body.
    await FU.input('row.entity.inventory_uuid', code, itemCell);

    const externalAnchor = $('body > ul.dropdown-menu.ng-isolate-scope:not(.ng-hide)');
    const option = externalAnchor.element(by.cssContainingText('[role="option"]', code));
    await option.click();
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
    const priceCell = await GU.getCell(gridId, rowNumber, 5);
    await FU.input('row.entity.unit_price', price, priceCell);
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
    const quantityCell = await GU.getCell(gridId, rowNumber, 4);
    await FU.input('row.entity.quantity', quantity, quantityCell);
  };

  // click the reset modal button
  page.reset = async function reset() {
    await $('[data-action="close"]').click();
  };

  // bind the buttons for external use
  page.btns = btns;
}

// expose to the world!
module.exports = PurchaseOrderPage;
