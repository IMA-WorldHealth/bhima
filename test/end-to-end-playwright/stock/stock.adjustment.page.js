const TU = require('../shared/TestUtils');
const { by } = require('../shared/TestUtils');

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
    return TU.locator(by.id(`btn-${value}`)).click();
  };

  /**
   * @method setDescription
   * @param {string} descrition - the exit description
   */
  page.setDescription = function setDescription(description) {
    return TU.input('StockCtrl.movement.description', description);
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
    await TU.input('row.entity.inventory', code, itemCell);

    const externalAnchor = TU.locator('body > ul.dropdown-menu.ng-isolate-scope:not(.ng-hide)');
    const option = externalAnchor.locator('[role="option"]').locator(by.containsText(code));
    await option.click();

    // select the inventory lot
    await TU.uiSelectAppended('row.entity.lot', lot, lotCell);

    // set the quantity
    await TU.input('row.entity.quantity', quantity, quantityCell);
  };

  /**
   * @method setQuantity
   */
  page.setQuantity = async (row, col, quantity) => {
    const quantityCell = await GU.getCell(gridId, row, col);
    await TU.input('row.entity.quantity', quantity, quantityCell);
  };

  /**
   * @method submit
   */
  page.submit = async function submit() {
    await TU.buttons.submit();

    // close the modal
    await TU.locator('[data-action="close"]').click();
  };
}

module.exports = StockAdjustmentPage;
