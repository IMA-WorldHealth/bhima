const moment = require('moment');
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
  // techinically this is 23 in total, but the grid doesn't render that
  // many on small screens
  const LOT_FOR_ALLTIME = 24;
  const LOT_FOR_TODAY = 17;
  const LOT_FOR_LAST_YEAR = 24;

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
    await GU.expectRowCount(gridId, LOT_FOR_ALLTIME);
  });

  it('find lots in depot principal', async () => {
    await modal.setDepot('Depot Principal');
    await modal.submit();
    await GU.expectRowCount(gridId, 16 + depotGroupingRow);
  });

  it('find lots by inventory', async () => {
    await modal.setInventory('Quinine');
    await modal.submit();
    await GU.expectRowCount(gridId, 4 + (2 * depotGroupingRow));
  });

  it('find lot by name', async () => {
    await modal.setLotLabel('VITAMINE-A');
    await modal.submit();
    await GU.expectRowCount(gridId, 1 + depotGroupingRow);
  });

  it('find lots by expiration date', async () => {
    const yearSubstract3 = moment(new Date(), 'YYYY').subtract(3, 'year');
    const formatYear = moment(yearSubstract3).format('YYYY');

    const startDate = `${formatYear}-01-01`;
    const endDate = `${formatYear}-12-31`;

    await modal.setdateInterval(
      moment(startDate).format('DD/MM/YYYY'),
      moment(endDate).format('DD/MM/YYYY'),
      'expiration-date',
    );

    await modal.submit();
    await GU.expectRowCount(gridId, 0);
  });

  it('Find the lots with a risk of expiry', async () => {
    await components.yesNoRadios.set('yes', 'isExpiryRisk');
    await modal.switchToDefaultFilterTab();
    await modal.setPeriod('allTime');

    await modal.submit();
    await GU.expectRowCount(gridId, 0);
  });

  it('Find the lots with no risk of expiry', async () => {
    await components.yesNoRadios.set('no', 'isExpiryRisk');
    await modal.switchToDefaultFilterTab();
    await modal.setPeriod('allTime');

    await modal.submit();
    await GU.expectRowCount(gridId, 24);
  });

  it('find inventories by group', async () => {
    await components.inventoryGroupSelect.set(inventoryGroup);
    await FU.modal.submit();
    await GU.expectRowCount(gridId, 9);
    await filters.resetFilters();
  });
}

module.exports = StockLotsRegistryTests;
