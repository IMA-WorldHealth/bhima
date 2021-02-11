const helpers = require('../shared/helpers');
const SearchModal = require('../shared/search.page');
const Page = require('./stock.aggregate_consumption.page');

function StockAggregateConsumptionTests() {
  // let modal;
  let page;

  // actions before each tests
  beforeEach(beforeEachActions);

  function beforeEachActions() {
    page = new Page();
    // modal = new SearchModal('stock-aggregate-consumption-search');
    helpers.navigate('#/stock/aggregated_consumption');
  }

  const DEPOT_TERTIAIRE = 'Depot Tertiaire';

  const SERVICE = 'Test Service';
  const REFERENCES = ['SREQ.TPA.5', 'SREQ.TPA.6', 'SREQ.TPA.7', 'SREQ.TPA.8'];
  const NOT_REFERENCE = 'SREQ.ZERO';

  it(`Should select the ${DEPOT_TERTIAIRE}`, async () => {
    await page.changeDepot(DEPOT_TERTIAIRE);
  });

  it(`Create a new stock aggregate consumption on current depot ${DEPOT_TERTIAIRE}`, async () => {
    await page.setPeriod(85);

    await page.setDescription(`Quick Requisition from current depot ${DEPOT_TERTIAIRE}`);

    // eslint-disable-next-line no-undef
    // browser.sleep();
    // await page.submit();

  });

  // it(`Create a new stock requisition from scratch for a service`, async () => {
  //   await page.showCreateModal();
  //   await page.setRequestor(SERVICE, 'service');
  //   await page.setDepot(DEPOT_SECONDAIRE);
  //   await page.setRows(2);
  //   await page.addItem(0, 'Quinine', 20);
  //   await page.addItem(1, 'Vitamines', 20);
  //   await page.setDescription(`Requisition for ${SERVICE}`);
  //   await page.submit();
  // });

  // it(`Create a new stock requisition from scratch for a depot`, async () => {
  //   await page.showCreateModal();
  //   await page.setRequestor(DEPOT_SECONDAIRE, 'depot');
  //   await page.setDepot(DEPOT_PRINCIPAL);
  //   await page.setRows(2);
  //   await page.addItem(0, 'Quinine Bichlorhydrate, sirop, 100mg base/5ml, 100ml, flacon, Unité', 4);
  //   await page.addItem(1, 'Prednisolone, 0,5%, Solution, Flacon, Unité', 500);
  //   await page.setDescription(`Requisition for ${DEPOT_SECONDAIRE}`);
  //   await page.submit();
  // });

  // it(`Create a Cancelled requisition`, async () => {
  //   await page.showCreateModal();
  //   await page.setRequestor(DEPOT_TERTIAIRE, 'depot');
  //   await page.setDepot(DEPOT_SECONDAIRE);
  //   await page.setRows(3);
  //   await page.addItem(0, 'Bottes, couleur noire, caoutchouc, taille 44, Paire', 20);
  //   await page.addItem(1, 'Atazanavir + Ritonavir 30 mg + 100 mg, 30 comp, unité', 25);
  //   await page.addItem(2, 'Chlorhexidine sol concentrée à 5% 100 ml,flacon,unité', 35);
  //   await page.setDescription(`Requisition for ${DEPOT_SECONDAIRE}`);
  //   await page.submit();
  // });

  // it(`Create a requisition for other depot`, async () => {
  //   await page.showCreateModal();
  //   await page.setRequestor(DEPOT_TERTIAIRE, 'depot');
  //   await page.setDepot(DEPOT_SECONDAIRE);
  //   await page.setRows(2);
  //   await page.addItem(0, 'Quinine Bichlorhydrate, sirop, 100mg base/5ml, 100ml, flacon, Unité', 4);
  //   await page.addItem(1, 'Vitamines', 20);
  //   await page.setDescription(`Requisition for ${DEPOT_SECONDAIRE}`);
  //   await page.submit();
  // });

  // it('Search requisition by depot requestor', async () => {
  //   await SearchModal.open();
  //   await modal.reset();
  //   await modal.setRequestor(DEPOT_SECONDAIRE, 'depot');
  //   await modal.submit();
  //   await page.expectRowCount(2);

  //   await SearchModal.open();
  //   await modal.reset();
  //   await modal.setRequestor(DEPOT_PRINCIPAL, 'depot');
  //   await modal.submit();
  //   await page.expectRowCount(1);
  // });

  // it('Search requisition by service requestor', async () => {
  //   await SearchModal.open();
  //   await modal.reset();
  //   await modal.setRequestor(SERVICE, 'service');
  //   await modal.submit();
  //   await page.expectRowCount(2);
  // });

  // it('Search requisition by depot supplier', async () => {
  //   await SearchModal.open();
  //   await modal.reset();
  //   await modal.setDepot(DEPOT_SECONDAIRE);
  //   await modal.submit();
  //   await page.expectRowCount(7);

  //   await SearchModal.open();
  //   await modal.reset();
  //   await modal.setDepot(DEPOT_PRINCIPAL);
  //   await modal.submit();
  //   await page.expectRowCount(2);
  // });

  // it('Search requisition by reference', async () => {
  //   await SearchModal.open();
  //   await modal.reset();
  //   await modal.setReference(REFERENCES[0]);
  //   await modal.submit();
  //   await page.expectRowCount(1);

  //   await SearchModal.open();
  //   await modal.reset();
  //   await modal.setReference(REFERENCES[1]);
  //   await modal.submit();
  //   await page.expectRowCount(1);

  //   await SearchModal.open();
  //   await modal.reset();
  //   await modal.setReference(REFERENCES[2]);
  //   await modal.submit();
  //   await page.expectRowCount(1);

  //   await SearchModal.open();
  //   await modal.reset();
  //   await modal.setReference(NOT_REFERENCE);
  //   await modal.submit();
  //   await page.expectRowCount(0);
  // });

  // it('Remove stock requisition', async () => {
  //   await SearchModal.open();
  //   await modal.reset();
  //   await modal.setReference(REFERENCES[0]);
  //   await modal.submit();
  //   await page.removeRequisition(0);
  //   await page.expectRowCount(0);
  // });

  // it('Change the status of a requisition', async () => {
  //   await SearchModal.open();
  //   await modal.reset();
  //   await modal.setReference(REFERENCES[3]);
  //   await modal.submit();
  //   await page.changeStatus(0, 'cancelled');
  // });
}

module.exports = StockAggregateConsumptionTests;
