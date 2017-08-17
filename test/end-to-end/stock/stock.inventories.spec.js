/* global element, by, browser */
'use strict';

const FU = require('../shared/FormUtils');
const GU = require('../shared/GridUtils');
const helpers = require('../shared/helpers');
const components = require('../shared/components');

function StockInventoriesRegistryTests() {

  // navigate to the page
  before(() => helpers.navigate('#/stock/inventories'));

  const gridId = 'stock-inventory-grid';

  const depotGroupingRow = 1;

  it('find inventory by depot', () => {

    FU.buttons.search();
    FU.uiSelect('$ctrl.bundle.depot_uuid', 'Depot Secondaire');
    FU.modal.submit();
    GU.expectRowCount(gridId, 2 + depotGroupingRow);

    FU.buttons.search();
    FU.uiSelect('$ctrl.bundle.depot_uuid', 'Depot Principal');
    FU.modal.submit();
    GU.expectRowCount(gridId, 3 + depotGroupingRow);

    // clear filters
    FU.buttons.clear();
  });

  it('find inventory by name', () => {

    FU.buttons.search();
    FU.uiSelect('$ctrl.bundle.inventory_uuid', 'First Test Inventory Item');
    FU.modal.submit();
    GU.expectRowCount(gridId, 2 + (2 * depotGroupingRow));

    // clear filters
    FU.buttons.clear();
  });

  it('find inventories by state', () => {
    // sold out
    FU.buttons.search();
    FU.radio('$ctrl.bundle.status', 0);
    FU.modal.submit();
    GU.expectRowCount(gridId, 0);

    // in stock
    FU.buttons.search();
    FU.radio('$ctrl.bundle.status', 1);
    FU.modal.submit();
    GU.expectRowCount(gridId, 0);

    // security reached
    FU.buttons.search();
    FU.radio('$ctrl.bundle.status', 2);
    FU.modal.submit();
    GU.expectRowCount(gridId, 0);

    // minimum reached
    FU.buttons.search();
    FU.radio('$ctrl.bundle.status', 3);
    FU.modal.submit();
    GU.expectRowCount(gridId, 2 + (depotGroupingRow));

    // over maximum
    FU.buttons.search();
    FU.radio('$ctrl.bundle.status', 4);
    FU.modal.submit();
    GU.expectRowCount(gridId, 3 + (2 * depotGroupingRow));

    // clear filters
    FU.buttons.clear();
  });

}

describe('Stock Inventory Registry', StockInventoriesRegistryTests);
