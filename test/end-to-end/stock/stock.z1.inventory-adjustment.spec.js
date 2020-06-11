/* global */

const helpers = require('../shared/helpers');
const InventoryAdjustment = require('./stock.adjustment.page');
const StockInventoriesRegistryTests = require('./stock.z2.inventory-adjustment-inventories.spec');
const StockLotsRegistryTests = require('./stock.z3.inventory-adjustment-lots.spec');

function StockInventoryAdjustmentTests() {
  const DEPOT_PRINCIPAL = 'Depot Principal';
  const DESCRIPTION = 'Ajustement des articles en stock complet';

  // the page object
  const page = new InventoryAdjustment();

  // navigate to the page
  before(() => helpers.navigate('#/stock/inventory-adjustment'));

  it(`Should select the ${DEPOT_PRINCIPAL}`, () => {
    return page.setDepot(DEPOT_PRINCIPAL);
  });

  it('Should make inventory adjustment correctly', async () => {
    await page.setDate(new Date());

    await page.setDescription(DESCRIPTION);

    // set all other to zero
    for (let i = 0; i < 17; i++) {
      // eslint-disable-next-line
      await page.setQuantity(i, 5, 0);
    }

    // set the VITAMINE-A to 23
    await page.setQuantity(3, 5, 23);

    // set the QUININE-C to 17
    await page.setQuantity(9, 5, 17);

    // submit
    await page.submit();
  });
}

describe('Stock Inventory Adjustment', () => {
  describe('Inventory Adjustment Test', StockInventoryAdjustmentTests);
  describe('Inventory Registry After Adjustment', StockInventoriesRegistryTests);
  describe('Lots Registry After Adjustment', StockLotsRegistryTests);
});
