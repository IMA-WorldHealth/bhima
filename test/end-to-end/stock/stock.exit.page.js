/* global element, by */

const FU = require('../shared/FormUtils');
const GU = require('../shared/GridUtils');
const components = require('../shared/components');

const SharedStockPage = require('./stock.shared.page');

function StockExitPage() {
  const page = this;

  const gridId = 'stock-exit-grid';

  // the grid id
  page.gridId = gridId;
  page.setDepot = SharedStockPage.setDepot;

  /**
   * @method setPatient
   * @param {string} reference - the patient reference
   */
  page.setPatient = function setPatient(reference, invoice, patientAlreadyCached) {
    components.stockEntryExitType.set('patient');

    if (!patientAlreadyCached) {
      components.findPatient.findById(reference);
    }

    if (invoice) {
      components.findInvoice.set(invoice);
    } else {
      clickJoinInvoice();
    }

    FU.modal.submit();
  };

  /**
   * @method unset invoice
   */
  function clickJoinInvoice() {
    const elm = element(by.model('$ctrl.joinInvoice'));
    elm.click();
  }

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
    const quantityCell = GU.getCell(gridId, rowNumber, 5);

    // enter data into the typeahead input.
    FU.input('row.entity.inventory', code, itemCell);

    const externalAnchor = $('body > ul.dropdown-menu.ng-isolate-scope:not(.ng-hide)');
    const option = externalAnchor.element(by.cssContainingText('[role="option"]', code));
    option.click();

    // select the inventory lot
    FU.uiSelectAppended('row.entity.lot', lot, lotCell);

    // set the quantity
    FU.input('row.entity.quantity', quantity, quantityCell);
  };

  /**
   * @method setLot
   */
  page.setLot = (rowNumber, lot) => {
    const lotCell = GU.getCell(gridId, rowNumber, 3);

    FU.uiSelectAppended('row.entity.lot', lot, lotCell);
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
