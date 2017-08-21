const GU = require('../shared/GridUtils');
const helpers = require('../shared/helpers');
const components = require('../shared/components');
const SearchModal = require('../shared/search.page');
const Filters = require('../shared/components/bhFilters');

function StockLotsRegistryTests() {
  let modal;
  let filters;

  // navigate to the page
  before(() => helpers.navigate('#/stock/lots'));

  beforeEach(() => {
    SearchModal.open();
    modal = new SearchModal('stock-lots-search');
    filters = new Filters();
  });

  afterEach(() => {
    filters.resetFilters();
  });

  const gridId = 'stock-lots-grid';

  const depotGroupingRow = 1;
  const LOT_FOR_ALLTIME = 16;
  const LOT_FOR_TODAY = 10;
  const LOT_FOR_LAST_YEAR = 16;
  

  it(`finds ${LOT_FOR_TODAY} lot for today`, () => {
    modal.switchToDefaultFilterTab();
    modal.setPeriod('today');
    modal.submit();
    GU.expectRowCount(gridId, LOT_FOR_TODAY);
  });

  it(`finds ${LOT_FOR_LAST_YEAR} lot for this last year`, () => {
    modal.switchToDefaultFilterTab();
    modal.setPeriod('year');
    modal.submit();
    GU.expectRowCount(gridId, LOT_FOR_LAST_YEAR);
  });

  it(`finds ${LOT_FOR_ALLTIME} lot for all time`, () => {
    modal.switchToDefaultFilterTab();
    modal.setPeriod('allTime');
    modal.submit();
    GU.expectRowCount(gridId, LOT_FOR_ALLTIME);
  });

  it('find lots in depot principal', () => {
    modal.setDepot('Depot Principal');
    modal.submit();
    GU.expectRowCount(gridId, 8 + depotGroupingRow);
  });

  it('find lots by inventory', () => {
    modal.setInventory('First Test Inventory Item');
    modal.submit();
    GU.expectRowCount(gridId, 8 + (2 * depotGroupingRow));
  });


  it('find lot by name', () => {
    modal.setLotLabel('VITAMINE-A');
    modal.submit();
    GU.expectRowCount(gridId, 3 + depotGroupingRow);
  });

  it('find lots by entry date', () => {
    modal.setdateInterval('02/02/2017', '02/02/2017', 'entry-date');
    modal.submit();
    GU.expectRowCount(gridId, 6 + (2 * depotGroupingRow));
  });

  it('find lots by expiration date', () => {
    modal.setdateInterval('01/01/2017', '31/12/2017', 'expiration-date');
    modal.submit();
    GU.expectRowCount(gridId, 1 + depotGroupingRow);
  });
}

describe('Stock Lots Registry', StockLotsRegistryTests);
