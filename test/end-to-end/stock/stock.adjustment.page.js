/* global element, by */

const FU = require('../shared/FormUtils');
const GU = require('../shared/GridUtils');
const components = require('../shared/components');
const SharedStockPage = require('./stock.shared.page');


function StockAdjustmentPage() {
  const page = this;

  const gridId = 'stock-adjustment-grid';

  // the grid id
  page.gridId = gridId;
  page.setDepot = SharedStockPage.setDepot;

  /**
   * @method setAdjustment
   * @param {number} radionIndex
   */
  page.setAdjustment = function setAdjustment(radionIndex) {
    FU.radio('StockCtrl.adjustmentOption', radionIndex);
  };

  /**
   * @method setDescription
   * @param {string} descrition - the exit description
   */
  page.setDescription = function setDescription(description) {
    FU.input('StockCtrl.movement.description', description);
  };

  /**
   * @method setDate
   * @param {string} date - the exit date
   */
  page.setDate = function setDate(date) {
    components.dateEditor.set(date);
  };

  /**
   * @method addRows
   */
  page.addRows = function addRows(n) {
    components.addItem.set(n);
  };

  /**
   * @method setItem
   */
  page.setItem = function setInventory(rowNumber, code, lot, quantity) {

    // inventory code column
    const itemCell = GU.getCell(gridId, rowNumber, 1);

    // inventory lot column
    const lotCell = GU.getCell(gridId, rowNumber, 3);

    // inventory quantity column
    const quantityCell = GU.getCell(gridId, rowNumber, 4);

    // enter data into the typeahead input.
    FU.input('row.entity.inventory', code, itemCell);

    // the typeahead should be open - use an id to click the right item
    element(by.id(`inv-code-${code}`)).click();

    // select the inventory lot
    FU.uiSelectAppended('row.entity.lot', lot, lotCell);

    // set the quantity
    FU.input('row.entity.quantity', quantity, quantityCell);
  };

  /**
   * @method submit
   */
  page.submit = function submit() {
    FU.buttons.submit();

    // the receipt modal is displayed
    FU.exists(by.id('receipt-confirm-created'), true);

    // close the modal
    $('[data-action="close"]').click();
  };
}

module.exports = StockAdjustmentPage;
