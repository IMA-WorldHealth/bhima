const FU = require('../shared/FormUtils');
const GU = require('../shared/GridUtils');
const helpers = require('../shared/helpers');
const SearchModal = require('../shared/search.page');
const Filters = require('../shared/components/bhFilters');

function StockMovementsRegistryTests() {
  let modal;
  let filters;

  // navigate to the page
  before(() => helpers.navigate('#/stock/movements'));

  beforeEach(async () => {
    await SearchModal.open();
    modal = new SearchModal('stock-movements-search');
    filters = new Filters();
  });

  afterEach(async () => {
    await filters.resetFilters();
  });

  const gridId = 'stock-movements-grid';
  const depotGroupingRow = 1;

  const REFERENCE = 'SM.9.5';

  it('finds movements for all time', async () => {
    await modal.switchToDefaultFilterTab();
    await modal.setPeriod('allTime');
    await modal.submit();
    await GU.expectRowCount(gridId, 16 + (2 * depotGroupingRow));
  });

  it('find entry movements ', async () => {
    // for Entry
    await modal.setEntryExit(0);
    await modal.switchToDefaultFilterTab();
    await modal.submit();
    await GU.expectRowCount(gridId, 7 + (2 * depotGroupingRow));
  });

  it('filters by entry/exit', async () => {
    // for Exit
    await modal.setEntryExit(1);
    await modal.switchToDefaultFilterTab();
    await modal.submit();
    await GU.expectRowCount(gridId, 10 + depotGroupingRow);
  });

  it('find movements by depot', async () => {
    await modal.setDepot('Depot Secondaire');
    await modal.submit();
    await GU.expectRowCount(gridId, 2 + depotGroupingRow);
  });

  it('find movements by Service', async () => {
    await modal.setServiceUuid('Administration');
    await modal.submit();
    await GU.expectRowCount(gridId, 1 + depotGroupingRow);
  });

  it('find by lots reasons for purchase order', async () => {
    await modal.setMovementReason(['Commande d\'achat']);
    await modal.submit();
    await GU.expectRowCount(gridId, 2 + depotGroupingRow);
  });

  it('find by lots reasons for distribution to patient', async () => {
    // to patient
    await modal.setMovementReason(['Vers un patient']);
    await modal.submit();
    await GU.expectRowCount(gridId, 3 + depotGroupingRow);
  });

  it('find by lots reasons for distribution to depot', async () => {
    await modal.setMovementReason(['Vers un dépôt']);
    await modal.submit();
    await GU.expectRowCount(gridId, 2 + depotGroupingRow);
  });

  it('find by lots reasons for distribution from depot', async () => {
    await modal.setMovementReason(['En provenance d\'un dépôt']);
    await modal.submit();
    await GU.expectRowCount(gridId, 1 + depotGroupingRow);
  });

  it('find by lots reasons for positive adjustement', async () => {
    await modal.setMovementReason(['Ajustement (Positif)']);
    await modal.submit();
    await GU.expectRowCount(gridId, 1 + depotGroupingRow);
  });

  it('find by lots reasons for negative adjustement', async () => {
    await modal.setMovementReason(['Ajustement (Negatif)']);
    await modal.submit();
    await GU.expectRowCount(gridId, 1 + depotGroupingRow);
  });

  it('find movements by reference', async () => {
    await modal.setReference(REFERENCE);
    await modal.submit();
    await GU.expectRowCount(gridId, 1 + depotGroupingRow);
  });
}

describe('Stock Movement Registry', StockMovementsRegistryTests);
