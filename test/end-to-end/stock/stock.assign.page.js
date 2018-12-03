/* global element */
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
    $('[data-method="create-record"]').click();
  };

  page.showSearchModal = () => {
    $('[data-method="search"]').click();
  };

  // depot select
  page.setDepot = depot => {
    components.depotSelect.set(depot);
  };

  // inventory select
  page.setInventory = text => {
    FU.uiSelect('$ctrl.inventory_uuid', text);
  };

  // lot select
  page.setLot = text => {
    FU.uiSelect('$ctrl.model.lot_uuid', text);
  };

  // entity select
  page.setEntity = entity => {
    components.entitySelect.set(entity);
  };

  // set quantity
  page.setQuantity = quantity => {
    FU.input('$ctrl.model.quantity', quantity);
  };

  // set description
  page.setDescription = description => {
    FU.input('$ctrl.model.description', description);
  };

  page.expectRowCount = (number) => {
    GU.expectRowCount(gridId, number);
  };

  page.expectCellValueMatch = (row, col, value) => {
    GU.expectCellValueMatch(gridId, row, col, value);
  };

  page.removeAssignment = () => {
    const cell = GU.getCell(gridId, 0, 7);
    cell.$('[data-method=action]').click();
    $('[data-method=remove-record]').click();
    FU.buttons.submit();
  };

  /**
   * @method submit
   */
  page.submit = function submit() {
    FU.buttons.submit();
    components.notification.hasSuccess();
  };
}

module.exports = StockAssignPage;
