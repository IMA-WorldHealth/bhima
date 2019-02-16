const helpers = require('../shared/helpers');
const SearchModal = require('../shared/search.page');
const Page = require('./stock.assign.page');

const { notification } = require('../shared/components');

function StockAssignTests() {
  let modal;
  let page;

  // navigate to the page
  before(() => helpers.navigate('#/stock/assign'));

  beforeEach(() => {
    page = new Page();
    modal = new SearchModal('stock-assign-search');
  });

  const record = {
    depot : 'Depot Principal',
    inventory : 'Multivitamine tab',
    lot : 'VITAMINE-A',
    entity : 'Bruce Wayne',
    description : 'Assign VITAMINE-A to Bruce Wayne',
    quantity : 1,
  };

  const record2 = {
    depot : 'Depot Secondaire',
    inventory : 'Quinine',
    lot : 'VITAMINE-B',
    entity : 'Wayne Enterprise',
  };

  it('Create a new stock assignment', () => {
    page.showCreateModal();
    page.setDepot(record.depot);
    page.setInventory(record.inventory);
    page.setLot(record.lot);
    page.setEntity(record.entity);
    page.setQuantity(record.quantity);
    page.setDescription(record.description);
    page.submit();
  });

  it('Search assignment by depot', () => {
    SearchModal.open();
    modal.setDepot(record.depot);
    modal.submit();
    page.expectRowCount(1);
    page.expectCellValueMatch(0, 0, record.depot);
  });

  it('Search assignment by a bad depot', () => {
    SearchModal.open();
    modal.setDepot(record2.depot);
    modal.submit();
    page.expectRowCount(0);
  });

  it('Search assignment by inventory', () => {
    SearchModal.open();
    modal.setDepot(record.depot);
    modal.setInventory(record.inventory);
    modal.submit();
    page.expectRowCount(1);
    page.expectCellValueMatch(0, 2, record.inventory);
  });

  it('Search assignment by a bad inventory', () => {
    SearchModal.open();
    modal.setDepot(record.depot);
    modal.setInventory(record2.inventory);
    modal.submit();
    page.expectRowCount(0);
  });

  it('Search assignment by lot', () => {
    SearchModal.open();
    modal.setDepot(record.depot);
    modal.setInventory(record.inventory);
    modal.setLotLabel(record.lot);
    modal.submit();
    page.expectRowCount(1);
    page.expectCellValueMatch(0, 3, record.lot);
  });

  it('Search assignment by a bad lot', () => {
    SearchModal.open();
    modal.setDepot(record.depot);
    modal.setInventory(record.inventory);
    modal.setLotLabel(record2.lot);
    modal.submit();
    page.expectRowCount(0);
  });

  it('Search assignment by entity', () => {
    SearchModal.open();
    modal.setDepot(record.depot);
    modal.setInventory(record.inventory);
    modal.setLotLabel(record.lot);
    modal.setEntity(record.entity);
    modal.submit();
    page.expectRowCount(1);
    page.expectCellValueMatch(0, 4, record.entity);
  });

  it('Search assignment by a bad entity', () => {
    SearchModal.open();
    modal.setDepot(record.depot);
    modal.setInventory(record.inventory);
    modal.setLotLabel(record.lot);
    modal.setEntity(record2.entity);
    modal.submit();
    page.expectRowCount(0);
  });

  it('Remove stock assignment', () => {
    SearchModal.open();
    modal.setDepot(record.depot);
    modal.setInventory(record.inventory);
    modal.setLotLabel(record.lot);
    modal.setEntity(record.entity);
    modal.submit();
    page.removeAssignment();
    notification.hasSuccess();
    page.expectRowCount(0);
  });
}

describe('Stock Assign Module', StockAssignTests);
