const GU = require('../shared/GridUtils');
const helpers = require('../shared/helpers');
const SearchModal = require('../shared/search.page');
const Filters = require('../shared/components/bhFilters');
const components = require('../shared/components');
const FU = require('../shared/FormUtils');

function StockLotsRegistryTests() {
  let modal;
  let filters;

  // navigate to the page
  before(() => helpers.navigate('#/stock/lots'));

  beforeEach(async () => {
    await SearchModal.open();
    modal = new SearchModal('stock-lots-search');
    filters = new Filters();
  });

  afterEach(async () => {
    await filters.resetFilters();
  });

  const gridId = 'stock-lots-grid';

  const depotGroupingRow = 1;
  // techinically this is 26 in total, but the grid doesn't render that
  // many on small screens
  const LOT_FOR_ALLTIME = 22;
  const LOT_FOR_TODAY = 19;
  const LOT_FOR_LAST_YEAR = 27;

  const inventoryGroup = 'Injectable';

  it(`finds ${LOT_FOR_TODAY} lot for today`, async () => {
    await modal.switchToDefaultFilterTab();
    await modal.setPeriod('today');
    await modal.submit();
    await GU.expectRowCount(gridId, LOT_FOR_TODAY);
  });

  it(`finds ${LOT_FOR_LAST_YEAR} lot for this last year`, async () => {
    await modal.switchToDefaultFilterTab();
    await modal.setPeriod('year');
    await modal.submit();
    await GU.expectRowCount(gridId, LOT_FOR_LAST_YEAR);
  });

  it(`finds at least ${LOT_FOR_ALLTIME} lot for all time`, async () => {
    await modal.switchToDefaultFilterTab();
    await modal.setPeriod('allTime');
    await modal.submit();
    await GU.expectRowCountAbove(gridId, LOT_FOR_ALLTIME);
  });

  it('find lots in depot principal', async () => {
    await modal.setDepot('Depot Principal');
    await modal.submit();
    await GU.expectRowCount(gridId, 19 + depotGroupingRow);
  });

  it('find lots by inventory', async () => {
    await modal.setInventory('Quinine');
    await modal.submit();
    await GU.expectRowCount(gridId, 4 + (2 * depotGroupingRow));
  });

  it('find lot by name', async () => {
    await modal.setLotLabel('VITAMINE-A');
    await modal.submit();
    await GU.expectRowCount(gridId, 3 + depotGroupingRow);
  });

  it('find lots by entry date', async () => {
    await modal.setdateInterval('02/02/2017', '02/02/2017', 'entry-date');
    await modal.submit();
    await GU.expectRowCount(gridId, 6);
  });

  it('find lots by expiration date', async () => {
    await modal.setdateInterval('01/01/2017', '31/12/2017', 'expiration-date');
    await modal.submit();
    await GU.expectRowCount(gridId, 1 + depotGroupingRow);
  });

  it('find inventories by group', async () => {
    await components.inventoryGroupSelect.set(inventoryGroup);
    await FU.modal.submit();
    await GU.expectRowCount(gridId, 10);
    await filters.resetFilters();
  });
}

describe('Stock Lots Registry', StockLotsRegistryTests);
