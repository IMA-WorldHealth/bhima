const FU = require('../shared/FormUtils');
const GU = require('../shared/GridUtils');
const helpers = require('../shared/helpers');
const components = require('../shared/components');
const SearchModal = require('../shared/search.page');
const Filters = require('../shared/components/bhFilters');

function StockOriginsRegistryTests() {
  let modal;
  let filters;

  // navigate to the page
  before(() => helpers.navigate('#/stock/origins'));

  beforeEach(() => {
    SearchModal.open();
    modal = new SearchModal('stock-origins-search');
    filters = new Filters();
  });

  afterEach(() => {
    filters.resetFilters();
  });

  const gridId = 'stock-origins-grid';

  const ORIGIN_FOR_ALLTIME = 16;

  it(`finds ${ORIGIN_FOR_ALLTIME} lot Origin allTime`, () => {
    modal.switchToDefaultFilterTab();
    modal.setPeriod('allTime');
    modal.submit();
    GU.expectRowCount(gridId, ORIGIN_FOR_ALLTIME);
  });

  it('find lot origin from Purchase Order PO.TPA.1', () => {
    modal.setOrigin('PO.TPA.1');
    modal.submit();
    GU.expectRowCount(gridId, 6);
  });

  it('find lot Origin By Name', () => {
    modal.setLotLabel('VITAMINE-A');
    modal.submit();
    GU.expectRowCount(gridId, 2);
  });

  it('find lots Origin by inventory', () => {
    modal.setInventory('First Test Inventory Item');
    modal.submit();
    GU.expectRowCount(gridId, 10);
  });

  it('find lots Origins by entry date', () => {
    modal.setdateInterval('02/02/2017', '02/02/2017', 'entry-date');
    modal.submit();
    GU.expectRowCount(gridId, 6);
  });

  it('find lots Origins by expiration date', () => {
    modal.setdateInterval('01/01/2017', '31/12/2017', 'expiration-date');
    modal.submit();
    GU.expectRowCount(gridId, 2);
  });

}

describe('Stock Origin Registry', StockOriginsRegistryTests);
