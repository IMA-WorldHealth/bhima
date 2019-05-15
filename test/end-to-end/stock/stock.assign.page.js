/* global element, by */
const FU = require('../shared/FormUtils');
const GU = require('../shared/GridUtils');
const components = require('../shared/components');

function StockAssignPage() {
  const page = this;
  const gridId = 'stock-assign-grid';

  // the grid id
  page.gridId = gridId;

  // create modal
  page.showCreateModal = () => {
    return $('[data-method="create-record"]').click();
  };

  page.showSearchModal = () => {
    return $('[data-method="search"]').click();
  };

  // depot select
  page.setDepot = depot => {
    return components.depotSelect.set(depot);
  };

  // inventory select
  page.setInventory = text => {
    return FU.uiSelect('$ctrl.inventory_uuid', text);
  };

  // lot select
  page.setLot = text => {
    return FU.uiSelect('$ctrl.model.lot_uuid', text);
  };

  // entity select
  page.setEntity = entity => {
    return components.entitySelect.set(entity);
  };

  // set quantity
  page.setQuantity = quantity => {
    return FU.input('$ctrl.model.quantity', quantity);
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

  page.removeAssignment = async () => {
    const cell = await GU.getCell(gridId, 0, 7);
    await cell.$('[data-method=action]').click();
    await $('[data-method=remove-record]').click();
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

module.exports = StockAssignPage;
