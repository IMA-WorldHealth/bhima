/* global element, by */
const { expect } = require('chai');
const helpers = require('../shared/helpers');
// const SearchModal = require('../shared/search.page');
const Page = require('./stock.requisition.page');

// const { notification } = require('../shared/components');

function StockRequisitionTests() {
  // let modal;
  let page;

  // navigate to the page
  before(() => helpers.navigate('#/stock/requisition'));

  beforeEach(() => {
    page = new Page();
    // modal = new SearchModal('stock-requisition-search');
  });

  const DEPOT_PRINCIPAL = 'Depot Principal';
  const DEPOT_SECONDAIRE = 'Depot Secondaire';
  const SERVICE = 'Test Service';

  it(`Should select the ${DEPOT_PRINCIPAL}`, async () => {
    await page.changeDepot(DEPOT_PRINCIPAL);
  });

  it(`Create a new stock requisition based on current depot ${DEPOT_PRINCIPAL}`, async () => {
    await page.showCreateModal(true);
    await page.setDepot(DEPOT_SECONDAIRE);
    await page.setRows(2);
    await page.addItem(0, 'Quinine', 100);
    await page.addItem(1, 'Multivitamine', 500);
    await page.setDescription(`Quick Requisition from current depot ${DEPOT_PRINCIPAL}`);
    await page.submit();
  });

  it(`Create a new stock requisition from scratch for a service`, async () => {
    await page.showCreateModal();
    await page.setRequestor(SERVICE, 'service');
    await page.setDepot(DEPOT_SECONDAIRE);
    await page.setRows(2);
    await page.addItem(0, 'Quinine', 20);
    await page.addItem(1, 'Multivitamine', 20);
    await page.setDescription(`Requisition for ${SERVICE}`);
    await page.submit();
  });

  it(`Create a new stock requisition from scratch for a depot`, async () => {
    await page.showCreateModal();
    await page.setRequestor(DEPOT_SECONDAIRE, 'depot');
    await page.setDepot(DEPOT_PRINCIPAL);
    await page.setRows(3);
    await page.addItem(0, 'Amoxycilline 250mg', 1000);
    await page.addItem(1, 'Acide folique 5mg', 1000);
    await page.addItem(2, 'Cotrimoxazol 960mg tab', 5000);
    await page.setDescription(`Requisition for ${DEPOT_SECONDAIRE}`);
    await page.submit();
  });

  // it('Search requisitionment by depot', async () => {
  //   await SearchModal.open();
  //   await modal.setDepot(record.depot);
  //   await modal.submit();
  //   await page.expectRowCount(1);
  //   await page.expectCellValueMatch(0, 0, record.depot);
  // });

  // it('Search requisitionment by a bad depot', async () => {
  //   await SearchModal.open();
  //   await modal.setDepot(record2.depot);
  //   await modal.submit();
  //   await page.expectRowCount(0);
  // });

  // it('Search requisitionment by inventory', async () => {
  //   await SearchModal.open();
  //   await modal.setDepot(record.depot);
  //   await modal.setInventory(record.inventory);
  //   await modal.submit();
  //   await page.expectRowCount(1);
  //   await page.expectCellValueMatch(0, 2, record.inventory);
  // });

  // it('Search requisitionment by a bad inventory', async () => {
  //   await SearchModal.open();
  //   await modal.setDepot(record.depot);
  //   await modal.setInventory(record2.inventory);
  //   await modal.submit();
  //   await page.expectRowCount(0);
  // });

  // it('Search requisitionment by lot', async () => {
  //   await SearchModal.open();
  //   await modal.setDepot(record.depot);
  //   await modal.setInventory(record.inventory);
  //   await modal.setLotLabel(record.lot);
  //   await modal.submit();
  //   await page.expectRowCount(1);
  //   await page.expectCellValueMatch(0, 3, record.lot);
  // });

  // it('Search requisitionment by a bad lot', async () => {
  //   await SearchModal.open();
  //   await modal.setDepot(record.depot);
  //   await modal.setInventory(record.inventory);
  //   await modal.setLotLabel(record2.lot);
  //   await modal.submit();
  //   await page.expectRowCount(0);
  // });

  // it('Search requisitionment by entity', async () => {
  //   await SearchModal.open();
  //   await modal.setDepot(record.depot);
  //   await modal.setInventory(record.inventory);
  //   await modal.setLotLabel(record.lot);
  //   await modal.setEntity(record.entity);
  //   await modal.submit();
  //   await page.expectRowCount(1);
  //   await page.expectCellValueMatch(0, 4, record.entity);
  // });

  // it('Search requisitionment by a bad entity', async () => {
  //   await SearchModal.open();
  //   await modal.setDepot(record.depot);
  //   await modal.setInventory(record.inventory);
  //   await modal.setLotLabel(record.lot);
  //   await modal.setEntity(record2.entity);
  //   await modal.submit();
  //   await page.expectRowCount(0);
  // });

  // it('Remove stock requisitionment', async () => {
  //   await SearchModal.open();
  //   await modal.setDepot(record.depot);
  //   await modal.setInventory(record.inventory);
  //   await modal.setLotLabel(record.lot);
  //   await modal.setEntity(record.entity);
  //   await modal.submit();
  //   await page.removeRequisitionment();
  //   await notification.hasSuccess();
  //   await page.expectRowCount(0);
  // });
}

describe.only('Stock Requisition Module', StockRequisitionTests);
