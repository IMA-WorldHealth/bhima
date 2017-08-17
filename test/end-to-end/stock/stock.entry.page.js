/* global element, by, browser */

const FU = require('../shared/FormUtils');
const GU = require('../shared/GridUtils');
const components = require('../shared/components');

function StockEntryPage() {
  const page = this;

  const gridId = 'stock-entry-grid';

  // the grid id
  page.gridId = gridId;

  /**
   * @method setDepot
   * @param {string} label - the depot label
   */
  page.setDepot = function setDepot(label) {
    components.depotDropdown.set(label);
  };

  /**
   * @method setPurchase
   * @param {string} rowNumber - the purchase line on the modal
   */
  page.setPurchase = function setPurchase(rowNumber) {
    components.stockEntryExitType.set('purchase');
    GU.selectRow('PurchaseGrid', rowNumber);
    FU.modal.submit();
  };

  /**
   * @method setTransfer
   * @param {string} rowNumber - movement line on the modal grid
   */
  page.setTransfer = function setTransfer(rowNumber) {
    components.stockEntryExitType.set('transfer_reception');
    GU.selectRow('TransferGrid', rowNumber);
    FU.modal.submit();
  };

  /**
   * @method setIntegration
   */
  page.setIntegration = function setIntegration() {
    components.stockEntryExitType.set('integration');
  };

  /**
   * @method setDescription
   * @param {string} descrition - the entry description
   */
  page.setDescription = function setDescription(description) {
    FU.input('StockCtrl.movement.description', description);
  };

  /**
   * @method setDate
   * @param {string} date - the entry date
   */
  page.setDate = function setDate(date) {
    components.dateEditor.set(date);
  };

  /**
   * @method addRows
   */
  page.addRows = function addRows(n) {
    FU.input('StockCtrl.itemIncrement', n);
    element(by.css('[id="btn-add-rows"]')).click();
  };

  /**
   * @method setItem
   */
  page.setItem = function setInventory(rowNumber, code) {

    // inventory code column
    const itemCell = GU.getCell(gridId, rowNumber, 1);

    // enter data into the typeahead input.
    FU.input('row.entity.inventory', code, itemCell);

    // the typeahead should be open - use an id to click the right item
    element(by.id(`inv-code-${code}`)).click();
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
  page.setLots = function setLots(inventoryRowNumber, lotsArray, isTransferReception, inventoryQuantity, inventoryUnitCost) {
    // lots column
    const launchLots = GU.getCell(gridId, inventoryRowNumber, 3);

    launchLots.$('[data-lots]').click();

    const lotGridId = 'LotsGrid';

    let lotCell;
    let quantityCell;
    let expirationDateCell;

    if (inventoryQuantity) {
      FU.input('$ctrl.inventory.quantity', inventoryQuantity);
    }

    if (inventoryUnitCost) {
      FU.input('$ctrl.inventory.unit_cost', inventoryUnitCost);
    }

    lotsArray.forEach((lot, index) => {      
      lotCell = GU.getCell(lotGridId, index, 1);
      quantityCell = GU.getCell(lotGridId, index, 2);
      expirationDateCell = GU.getCell(lotGridId, index, 3);

      // enter lot label
      if(!isTransferReception){
        FU.input('row.entity.lot', lot.label, lotCell);
      }        

      // enter lot quantity
      FU.input('row.entity.quantity', lot.quantity, quantityCell);
      
      // enter lot expiration date
      if(!isTransferReception){
        components.datePicker.set(lot.expiration_date, expirationDateCell);
      }  

      if (index < lotsArray.length - 1) {
        // Add another lot line
        $('[data-add-lot]').click();
      }
    });

    FU.modal.submit();
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

module.exports = StockEntryPage;
