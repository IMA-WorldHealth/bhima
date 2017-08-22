const FU = require('../shared/FormUtils');
const GU = require('../shared/GridUtils');
const helpers = require('../shared/helpers');
const components = require('../shared/components');
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
    GU.expectRowCount(gridId, 25);
  });

  it('find entry movements ', () => {
    // for Entry
    modal.setEntryExit(0);
    modal.submit();
    GU.expectRowCount(gridId, 15 + (2 * depotGroupingRow));
  });

  it('find exit movements', () => {
    // for Exit
    modal.setEntryExit(1);
    modal.submit();
    GU.expectRowCount(gridId, 16 + depotGroupingRow);
  });

  it('find movements by depot', () => {
    modal.setDepot('Depot Principal');
    modal.submit();
    GU.expectRowCount(gridId, 17 + depotGroupingRow);
  });

  it('find movements by inventory', () => {
    modal.setInventory('First Test Inventory Item');
    modal.submit();
    GU.expectRowCount(gridId, 13 + (2 * depotGroupingRow));
  });


  it('find movements by lot name', () => {
    modal.setLotLabel('VITAMINE-A');
    FU.modal.submit();
    GU.expectRowCount(gridId, 5 + depotGroupingRow);
  });

  it('find by lots reasons for purchase order', () => {
    // FIX ME: reasons must not depend on translations
    //selection with `id` works but it is not completed
    modal.setMovementReason('Commande d\'achat');
    modal.submit();
    GU.expectRowCount(gridId, 24 + depotGroupingRow);
  });

  it('find by lots reasons for distribution to patient', () => {
     // to patient
    modal.setMovementReason('Vers un patient');
    modal.submit();
    GU.expectRowCount(gridId, 24 + depotGroupingRow);    
  });

  it('find by lots reasons for distribution to depot', () => {
    modal.setMovementReason('Vers un depot');
    modal.submit();
    GU.expectRowCount(gridId, 24 + depotGroupingRow);
  });

  it('find by lots reasons for distribution from depot', () => {
    // from depot
    modal.setMovementReason('En provenance d\'un depot');
    modal.submit();
    GU.expectRowCount(gridId, 24 + depotGroupingRow);
  });

  it('find by lots reasons for positive adjustement', () => {
    modal.setMovementReason('Ajustement (Positif)');
    modal.submit();
    GU.expectRowCount(gridId, 24 + depotGroupingRow);
  });

  it('find by lots reasons for negative adjustement', () => {
    modal.setMovementReason('Ajustement (Negatif)');
    modal.submit();
    GU.expectRowCount(gridId, 24 + depotGroupingRow);
  });  

  it('find lots by date - Fev 2017', () => {
    modal.setdateInterval('02/02/2017', '02/02/2017', 'date');
    modal.submit();
    GU.expectRowCount(gridId, 8 + depotGroupingRow);
  });

  it('find zero lot by date - january 2015', () => {
    modal.setdateInterval('01/01/2015', '30/01/2015', 'date');
    modal.submit();
    GU.expectRowCount(gridId, 0);
  });
}

describe('Stock Movement Registry', StockMovementsRegistryTests);
