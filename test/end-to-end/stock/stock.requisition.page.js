/* global element, by */
const FU = require('../shared/FormUtils');
const GU = require('../shared/GridUtils');
const components = require('../shared/components');
const SharedStockPage = require('./stock.shared.page');

function StockRequisitionPage() {
  const page = this;
  const gridId = 'stock-requisition-grid';
  const modalGridId = 'stock-requisition-grid-articles';

  // change current depot
  page.changeDepot = SharedStockPage.setDepot;

  // the grid id
  page.gridId = gridId;
  page.modalGridId = modalGridId;

  // create modal
  page.showCreateModal = async isNewRequisition => {
    const selector = isNewRequisition ? '[data-method="create-record"]' : '[data-method="create-other-record"]';
    await $(selector).click();
  };

  page.showSearchModal = () => {
    return $('[data-method="search"]').click();
  };

  // requestor select
  page.setRequestor = (requestor, type) => {
    return components.serviceOrDepotSelect.set(requestor, type);
  };

  // depot select
  page.setDepot = depot => {
    return components.depotSelect.set(depot, 'depot-supplier');
  };

  page.setRows = async number => {
    await components.addItem.set(number);
  };

  // add item
  page.addItem = async function setInventory(rowNumber, code, quantity) {
    // inventory code column
    const itemCell = await GU.getCell(modalGridId, rowNumber, 0);

    // inventory quantity column
    const quantityCell = await GU.getCell(modalGridId, rowNumber, 2);

    // enter data into the typeahead input.
    await FU.input('row.entity.inventory', code, itemCell);

    const externalAnchor = element(by.css('body > ul.dropdown-menu.ng-isolate-scope:not(.ng-hide)'));
    const option = externalAnchor.all(by.cssContainingText('[role="option"]', code)).first();
    await option.click();

    // set the quantity
    await FU.input('row.entity.quantity', quantity, quantityCell);
  };

  // set description
  page.setDescription = description => {
    return FU.input('$ctrl.model.description', description);
  };

  page.expectRowCount = (number) => {
    return GU.expectRowCount(gridId, number);
  };

  page.expectCellValueMatch = (row, col, value) => {
    return GU.expectCellValueMatch(gridId, row, col, value);
  };

  page.removeRequisition = async (row = 0) => {
    const cell = await GU.getCell(gridId, row, 7);
    await cell.$('[data-method=action]').click();
    await $('[data-method=remove-record]').click();
    await FU.buttons.submit();
    await components.notification.hasSuccess();
  };

  page.updateRequisition = async (row = 0) => {
    const cell = await GU.getCell(gridId, row, 7);
    await cell.$('[data-method=action]').click();
    await $('[data-method=edit-record]').click();
  };

  page.changeStatus = async (row = 0, status) => {
    const cell = await GU.getCell(gridId, row, 7);
    await cell.$('[data-method=action]').click();
    await $('[data-method=edit]').click();

    const selectStatus = element(by.id(status));
    await selectStatus.click();

    await FU.buttons.submit();
  };

  /**
   * @method submit
   */
  page.submit = async function submit() {
    await FU.buttons.submit();
    // the receipt modal is displayed
    await FU.exists(by.id('receipt-confirm-created'), true);
    // close the modal
    await element(by.css('[data-action="close"]')).click();
  };
}

module.exports = StockRequisitionPage;
