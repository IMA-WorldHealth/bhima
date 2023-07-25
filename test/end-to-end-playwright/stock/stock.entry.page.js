const TU = require('../shared/TestUtils');
const { by } = require('../shared/TestUtils');

/* eslint no-await-in-loop:off */

const GU = require('../shared/GridUtils');
const components = require('../shared/components');

const SharedStockPage = require('./stock.shared.page');

function StockEntryPage() {
  const page = this;

  const gridId = 'stock-entry-grid';
  const lotGridId = 'LotsGrid';

  // the grid id
  page.gridId = gridId;
  page.setDepot = SharedStockPage.setDepot;

  /**
   * @method setPurchase
   * @param {string} rowNumber - the purchase line on the modal
   */
  page.setPurchase = async function setPurchase(rowNumber) {
    await components.stockEntryExitType.set('purchase');
    await GU.selectRow('PurchaseGrid', rowNumber);
    await TU.modal.submit();
  };

  /**
   * @method setTransfer
   * @param {string} rowNumber - movement line on the modal grid
   */
  page.setTransfer = async function setTransfer(rowNumber) {
    await components.stockEntryExitType.set('transfer_reception');
    await GU.selectRow('TransferGrid', rowNumber);
    await TU.modal.submit();
  };

  /**
   * @method setIntegration
   */
  page.setIntegration = async function setIntegration() {
    await components.stockEntryExitType.set('integration');
  };

  /**
   * @method setDescription
   * @param {string} descrition - the entry description
   */
  page.setDescription = async function setDescription(description) {
    await TU.input('StockCtrl.movement.description', description);
  };

  /**
   * @method setDate
   * @param {string} date - the entry date
   */
  page.setDate = async function setDate(date) {
    await components.dateEditor.set(date);
  };

  /**
   * @method addRows
   */
  page.addRows = async function addRows(n) {
    await components.addItem.set(n);
  };

  /**
   * @method setItem
   */
  page.setItem = async function setInventory(rowNumber, code) {
    // inventory code column
    const itemCell = await GU.getCell(gridId, rowNumber, 1);

    // enter data into the typeahead input.
    await TU.input('row.entity.inventory_uuid', code, itemCell);

    const externalAnchor = await TU.locator('body > ul.dropdown-menu.ng-isolate-scope:not(.ng-hide)');
    // ??? const option = externalAnchor.locator(by.cssContainingText('[role="option"]', code));
    const option = await externalAnchor.locator('[role="option"]').locator(by.containsText(code));
    await option.click();
  };

  /**
   * @method setLots
   * @param {number} inventoryRowNumber - the number of the row of the inventory
   * @param {array} lotsArray - An array of lots
   * @example
   * // Array of lots
   * const lots = [
   *  { label: '...', quantity: '...', expiration_date: '...' }
   * ]
   */
  page.setLots = async function setLots(
    inventoryRowNumber, lotsArray, isTransferReception, inventoryQuantity, inventoryUnitCost,
  ) {
    // lots column
    await this.openLotsModal(inventoryRowNumber);

    let lotCell;
    let quantityCell;
    let expirationDateCell;

    if (inventoryQuantity) {
      await TU.input('$ctrl.stockLine.quantity', inventoryQuantity);
    }

    if (inventoryUnitCost) {
      await TU.input('$ctrl.stockLine.unit_cost', inventoryUnitCost);
    }

    let index = 0;
    // eslint-disable-next-line
    for (const lot of lotsArray) {
      lotCell = await GU.getCell(lotGridId, index, 1);
      quantityCell = await GU.getCell(lotGridId, index, 2);
      expirationDateCell = await GU.getCell(lotGridId, index, 3);

      // enter lot label
      if (!isTransferReception) {
        await TU.input('row.entity.lot', lot.label, lotCell);
      }

      // enter lot quantity
      await TU.input('row.entity.quantity', lot.quantity, quantityCell);

      // enter lot expiration date
      if (lot.expiration_date) {
        await components.datePicker.set(lot.expiration_date, expirationDateCell);
      }

      if (index < lotsArray.length - 1) {
        // Add another lot line
        await components.addItem.set(1, TU.locator('[uib-modal-transclude]'));
      }

      index += 1;
    }

    return TU.modal.submit();
  };

  /**
   * open lot modal
   */
  page.openLotsModal = async (inventoryRowNumber) => {
    const launchLots = await GU.getCell(gridId, inventoryRowNumber, 4);
    await launchLots.locator('[data-lots]').click();
  };

  /**
   * enable fast lots insertion
   */
  page.enableFastLotsInsert = () => {
    return TU.locator('#enableFastInsert').click();
  };

  /**
   * fast insert lots rows
   * @param {array} lots an array of strings
   */
  page.fastLotsInsert = async (lots) => {
    let index = 0;

    // eslint-disable-next-line
    for (const lot of lots) {
      const lotCell = await GU.getCell(lotGridId, index, 1);
      const input = await TU.input('row.entity.lot', lot, lotCell);
      await input.fill(protractor.Key.TAB);
      index += 1;
    }

    // when we insert the last lot and leave with tab there will be
    // a supplementary row added
    await GU.expectRowCount(lotGridId, lots.length + 1);
  };

  /**
   * @method submit
   */
  page.submit = async function submit() {
    await TU.buttons.submit();

    // the receipt modal is displayed
    await TU.exists(by.id('receipt-confirm-created'), true);

    // close the modal
    await TU.locator('[data-action="close"]').click();
  };
}

module.exports = StockEntryPage;
