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

  beforeEach(() => {
    SearchModal.open();
    modal = new SearchModal('stock-movements-search');
    filters = new Filters();
  });

  afterEach(() => {
    filters.resetFilters();
  });

  const gridId = 'stock-movements-grid';
  const depotGroupingRow = 1;

  it('finds lot for all time', () => {
    modal.switchToDefaultFilterTab();
    modal.setPeriod('allTime');
    modal.submit();
    GU.expectRowCountAbove(gridId, 20);
  });

  it('find entry movements ', () => {
    // for Entry
    modal.setEntryExit(0);
    modal.submit();
    GU.expectRowCount(gridId, 15 + (2 * depotGroupingRow));
  });

  it('filters by entry/exit', () => {
    // for Exit
    modal.setEntryExit(1);
    modal.submit();
    GU.expectRowCount(gridId, 9 + depotGroupingRow);
  });

  it('find movements by depot', () => {
    modal.setDepot('Depot Principal');
    modal.submit();
    GU.expectRowCount(gridId, 18 + depotGroupingRow);
  });

  it('find movements by inventory', () => {
    modal.setInventory('Quinine sulphate 500mg');
    modal.submit();
    GU.expectRowCount(gridId, 14 + (2 * depotGroupingRow));
  });


  it('find movements by lot name', () => {
    modal.setLotLabel('VITAMINE-A');
    FU.modal.submit();
    GU.expectRowCount(gridId, 5 + depotGroupingRow);
  });

  it('find by lots reasons for purchase order', () => {
    modal.setMovementReason(['Commande d\'achat']);
    modal.submit();
    GU.expectRowCount(gridId, 8 + depotGroupingRow);
  });

  it('find by lots reasons for distribution to patient', () => {
    // to patient
    modal.setMovementReason(['Vers un patient']);
    modal.submit();
    GU.expectRowCount(gridId, 3 + depotGroupingRow);
  });

  it('find by lots reasons for distribution to depot', () => {
    modal.setMovementReason(['Vers un dépôt']);
    modal.submit();
    GU.expectRowCount(gridId, 2 + depotGroupingRow);
  });

  it('find by lots reasons for distribution from depot', () => {
    // from depot
    modal.setMovementReason(['En provenance d\'un dépôt']);
    modal.submit();
    GU.expectRowCount(gridId, 1 + depotGroupingRow);
  });

  it('find by lots reasons for positive adjustement', () => {
    modal.setMovementReason(['Ajustement (Positif)']);
    modal.submit();
    GU.expectRowCount(gridId, 1 + depotGroupingRow);
  });

  it('find by lots reasons for negative adjustement', () => {
    modal.setMovementReason(['Ajustement (Negatif)']);
    modal.submit();
    GU.expectRowCount(gridId, 1 + depotGroupingRow);
  });
}

describe('Stock Movement Registry', StockMovementsRegistryTests);
