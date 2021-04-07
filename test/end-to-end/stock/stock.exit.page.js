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
  page.setPatient = async function setPatient(reference, invoice, patientAlreadyCached = false) {
    await components.stockEntryExitType.set('patient');

    if (!patientAlreadyCached) {
      await components.findPatient.findById(reference);
    }

    if (invoice) {
      await clickJoinInvoice();
      await components.findInvoice.set(invoice);
    }

    await FU.modal.submit();
  };

  /**
   * @method unset invoice
   */
  function clickJoinInvoice() {
    const elm = element(by.model('$ctrl.joinInvoice'));
    return elm.click();
  }

  /**
   * @method setService
   * @param {string} service - the service name
   */
  page.setService = async function setService(service) {
    await components.stockEntryExitType.set('service');
    const modalContent = element(by.css('[class="modal-content"]'));
    await FU.uiSelect('$ctrl.selected', service, modalContent);
    await FU.modal.submit();
  };

  /**
   * @method setServiceRequisition
   * @param {string} requisition.service - the service requisition name
   */
  page.setServiceRequisition = async function setServiceRequisition(requisition) {
    await components.stockEntryExitType.set('service');
    const modalContent = element(by.css('[class="modal-content"]'));
    await FU.uiSelect('$ctrl.selected', requisition.service, modalContent);
    await components.yesNoRadios.set('yes', 'requisitionVoucherExist');
    await components.requisitionSelect.set(requisition.reference);
    await FU.modal.submit();
  };

  /**
   * @method setDepotRequisition
   * @param {string} requisition.depot - the depot requisition name
   */
  page.setDepotRequisition = async function setDepotRequisition(requisition) {
    await components.stockEntryExitType.set('depot');
    const modalContent = element(by.css('[class="modal-content"]'));
    await FU.uiSelect('$ctrl.selected', requisition.depot, modalContent);
    await components.yesNoRadios.set('yes', 'requisitionVoucherExist');
    await components.requisitionSelect.set(requisition.reference);
    await FU.modal.submit();
  };

  /**
   * @method preventDepotRequisition
   * @param {string} requisition.depot - the depot requisition name
   */
  page.preventDepotRequisition = async function preventDepotRequisition(requisition) {
    await components.stockEntryExitType.set('depot');
    const modalContent = element(by.css('[class="modal-content"]'));
    await FU.uiSelect('$ctrl.selected', requisition.depot, modalContent);
    await components.yesNoRadios.set('yes', 'requisitionVoucherExist');
    await components.requisitionSelect.set(requisition.reference);
    await FU.modal.submit();
    await FU.exists(by.className(requisition.className), true);
    await FU.modal.cancel();
  };

  /**
   * @method setDestinationDepot
   * @param {string} depot - the depot name
   */
  page.setDestinationDepot = async function setDestinationDepot(depot) {
    await components.stockEntryExitType.set('depot');
    const modalContent = element(by.css('[class="modal-content"]'));
    await FU.uiSelect('$ctrl.selected', depot, modalContent);
    await FU.modal.submit();
  };

  /**
   * @method setLoss
   */
  page.setLoss = async function setLoss() {
    await components.stockEntryExitType.set('loss');
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
  page.setItem = async function setItem(rowNumber, code, lot, quantity) {
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
   * @method setLot
   */
  page.setLot = async (rowNumber, lot, quantity) => {
    const lotCell = await GU.getCell(gridId, rowNumber, 3);
    await FU.uiSelectAppended('row.entity.lot', lot, lotCell);

    if (quantity) {
      // inventory quantity column
      const quantityCell = await GU.getCell(gridId, rowNumber, 4);
      // set the quantity
      await FU.input('row.entity.quantity', quantity, quantityCell);
    }
  };

  /**
   * @method submit
   */
  page.submit = async function submit() {
    await FU.buttons.submit();

    // the receipt modal is displayed
    await FU.exists(by.id('receipt-confirm-created'), true);

    // close the modal
    await $('[data-action="close"]').click();
  };

  /**
   * @method submitError
   */
  page.submitError = async function submitError() {
    FU.buttons.submit();

    await components.notification.hasDanger();
  };

}

module.exports = StockExitPage;
