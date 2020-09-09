const GU = require('../shared/GridUtils');
const helpers = require('../shared/helpers');
const SearchModal = require('../shared/search.page');
const Filters = require('../shared/components/bhFilters');

module.exports = StockLotsRegistryTests;

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
  const LOT_FOR_ALLTIME = 19;
  const GROUPING_ROW = 1;

  it(`finds ${LOT_FOR_ALLTIME} lots for all time`, async () => {
    await modal.setDepot('Depot Principal');
    await modal.switchToDefaultFilterTab();
    await modal.setPeriod('allTime');
    await modal.submit();
    await GU.expectRowCount(gridId, GROUPING_ROW + LOT_FOR_ALLTIME);
  });

  it('find only lots set during the adjustment process', async () => {
    const quinine = {
      label : 'Quinine Bichlorhydrate, sirop, 100mg base/5ml, 100ml, flacon, Unité',
      lot : 'QUININE-B',
      quantity : '17',
    };

    const vitamine = {
      label : 'Vitamines B1+B6+B12, 100+50+0.5mg/2ml, Amp, Unité',
      lot : 'VITAMINE-B',
      quantity : '23',
    };

    await modal.setDepot('Depot Principal');

    // set the default value for include/exclude exhausted lots.
    await modal.switchToDefaultFilterTab();
    await $('[data-exclude-exhausted-lots]').click();

    await modal.submit();

    await GU.expectCellValueMatch(gridId, 1, 2, vitamine.label);
    await GU.expectCellValueMatch(gridId, 1, 4, vitamine.lot);
    await GU.expectCellValueMatch(gridId, 1, 5, vitamine.quantity);
    await GU.expectCellValueMatch(gridId, 2, 2, quinine.label);
    await GU.expectCellValueMatch(gridId, 2, 4, quinine.lot);
    await GU.expectCellValueMatch(gridId, 2, 5, quinine.quantity);

    await filters.resetFilters();
  });
}
