const helpers = require('../shared/helpers');
const SearchModal = require('../shared/search.page');
const Page = require('./stock.requisition.page');

// const { notification } = require('../shared/components');

function StockRequisitionTests() {
  let modal;
  let page;

  // navigate to the page
  before(() => helpers.navigate('#/stock/requisition'));

  beforeEach(() => {
    page = new Page();
    modal = new SearchModal('stock-requisition-search');
  });

  const DEPOT_PRINCIPAL = 'Depot Principal';
  const DEPOT_SECONDAIRE = 'Depot Secondaire';
  const SERVICE = 'Test Service';
  const REFERENCES = ['SREQ.1', 'SREQ.2', 'SREQ.3'];
  const NOT_REFERENCE = 'SREQ.ZERO';

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

  it('Search requisition by depot requestor', async () => {
    await SearchModal.open();
    await modal.reset();
    await modal.setRequestor(DEPOT_SECONDAIRE, 'depot');
    await modal.submit();
    await page.expectRowCount(1);

    await SearchModal.open();
    await modal.reset();
    await modal.setRequestor(DEPOT_PRINCIPAL, 'depot');
    await modal.submit();
    await page.expectRowCount(1);
  });

  it('Search requisition by service requestor', async () => {
    await SearchModal.open();
    await modal.reset();
    await modal.setRequestor(SERVICE, 'service');
    await modal.submit();
    await page.expectRowCount(1);
  });

  it('Search requisition by depot supplier', async () => {
    await SearchModal.open();
    await modal.reset();
    await modal.setDepot(DEPOT_SECONDAIRE);
    await modal.submit();
    await page.expectRowCount(2);

    await SearchModal.open();
    await modal.reset();
    await modal.setDepot(DEPOT_PRINCIPAL);
    await modal.submit();
    await page.expectRowCount(1);
  });

  it('Search requisition by reference', async () => {
    await SearchModal.open();
    await modal.reset();
    await modal.setReference(REFERENCES[0]);
    await modal.submit();
    await page.expectRowCount(1);

    await SearchModal.open();
    await modal.reset();
    await modal.setReference(REFERENCES[1]);
    await modal.submit();
    await page.expectRowCount(1);

    await SearchModal.open();
    await modal.reset();
    await modal.setReference(REFERENCES[2]);
    await modal.submit();
    await page.expectRowCount(1);

    await SearchModal.open();
    await modal.reset();
    await modal.setReference(NOT_REFERENCE);
    await modal.submit();
    await page.expectRowCount(0);
  });

  it('Remove stock requisitionment', async () => {
    await SearchModal.open();
    await modal.reset();
    await modal.setReference(REFERENCES[0]);
    await modal.submit();
    await page.removeRequisition(0);
    await page.expectRowCount(0);
  });
}

describe('Stock Requisition Module', StockRequisitionTests);
