/* global element, by, browser */

const FU = require('../shared/FormUtils');
const GU = require('../shared/GridUtils');
const components = require('../shared/components');

function StockExitPage() {
  const page = this;

  const gridId = 'stock-exit-grid';

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
   * @method setPatient
   * @param {string} reference - the patient reference
   */
  page.setPatient = function setPatient(reference) {
    components.stockEntryExitType.set('patient');
    components.findPatient.findById(reference);
    FU.modal.submit();
  };

  /**
   * @method setService
   * @param {string} service - the service name
   */
  page.setService = function setService(service) {
    components.stockEntryExitType.set('service');
    const modalContent = element(by.css('[class="modal-content"]'));
    FU.uiSelect('$ctrl.selected', service, modalContent);
    FU.modal.submit();
  };

  /**
   * @method setDestinationDepot
   * @param {string} depot - the depot name
   */
  page.setDestinationDepot = function setDestinationDepot(depot) {
    components.stockEntryExitType.set('depot');
    const modalContent = element(by.css('[class="modal-content"]'));
    FU.uiSelect('$ctrl.selected', depot, modalContent);
    FU.modal.submit();
  };

  /**
   * @method setLoss
   */
  page.setLoss = function setLoss() {
    components.stockEntryExitType.set('loss');
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
    FU.input('StockCtrl.itemIncrement', n);
    element(by.css('[id="btn-add-rows"]')).click();
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
    const quantityCell = GU.getCell(gridId, rowNumber, 5);

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

module.exports = StockExitPage;
