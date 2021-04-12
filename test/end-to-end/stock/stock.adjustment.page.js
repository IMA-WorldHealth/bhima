/* global by, element */

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
  page.setAdjustment = function setAdjustment(value) {
    return element(by.id(`btn-${value}`)).click();
  };

  /**
   * @method setDescription
   * @param {string} descrition - the exit description
   */
  page.setDescription = function setDescription(description) {
    return FU.input('StockCtrl.movement.description', description);
  };

  /**
   * @method setDate
   * @param {string} date - the exit date
   */
  page.setDate = function setDate(date) {
    return components.dateEditor.set(date);
  };

  /**
   * @method addRows
   */
  page.addRows = function addRows(n) {
    return components.addItem.set(n);
  };

  /**
   * @method setItem
   */
  page.setItem = async function setInventory(rowNumber, code, lot, quantity) {
    // inventory code column
    const itemCell = await GU.getCell(gridId, rowNumber, 1);

    // inventory lot column
    const lotCell = await GU.getCell(gridId, rowNumber, 3);

    // inventory quantity column
    const quantityCell = await GU.getCell(gridId, rowNumber, 4);

    // enter data into the typeahead input.
    await FU.input('row.entity.inventory', code, itemCell);

    const externalAnchor = $('body > ul.dropdown-menu.ng-isolate-scope:not(.ng-hide)');
    const option = externalAnchor.element(by.cssContainingText('[role="option"]', code));
    await option.click();

    // select the inventory lot
    await FU.uiSelectAppended('row.entity.lot', lot, lotCell);

    // set the quantity
    await FU.input('row.entity.quantity', quantity, quantityCell);
  };

  /**
   * @method setQuantity
   */
  page.setQuantity = async (row, col, quantity) => {
    const quantityCell = await GU.getCell(gridId, row, col);
    await FU.input('row.entity.quantity', quantity, quantityCell);
  };

  /**
   * @method submit
   */
  page.submit = async function submit() {
    await FU.buttons.submit();

    // close the modal
    await element(by.css('[data-action="close"]')).click();
  };
}

module.exports = StockAdjustmentPage;
