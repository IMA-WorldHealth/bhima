/* global element, by, browser */
'use strict';

const FU = require('../shared/FormUtils');
const GU = require('../shared/GridUtils');
const helpers = require('../shared/helpers');
const components = require('../shared/components');

function StockLotsRegistryTests() {

  // navigate to the page
  before(() => helpers.navigate('#/stock/lots'));

  const gridId = 'stock-lots-grid';

  const depotGroupingRow = 1;

  it('find lots by depot', () => {

    FU.buttons.search();
    FU.uiSelect('$ctrl.bundle.depot_uuid', 'Depot Secondaire');
    FU.modal.submit();
    GU.expectRowCount(gridId, 6 + depotGroupingRow);

    FU.buttons.search();
    FU.uiSelect('$ctrl.bundle.depot_uuid', 'Depot Principal');
    FU.modal.submit();
    GU.expectRowCount(gridId, 8 + depotGroupingRow);

    // clear filters
    FU.buttons.clear();
  });

  it('find lots by inventory', () => {

    FU.buttons.search();
    FU.uiSelect('$ctrl.bundle.inventory_uuid', 'First Test Inventory Item');
    FU.modal.submit();
    GU.expectRowCount(gridId, 9 + (2 * depotGroupingRow));

    // clear filters
    FU.buttons.clear();
  });


  it('find lot by name', () => {

    FU.buttons.search();
    FU.input('$ctrl.bundle.label', 'VITAMINE-A');
    FU.modal.submit();
    GU.expectRowCount(gridId, 1 + depotGroupingRow);

    // clear filters
    FU.buttons.clear();
  });

  it('find lots by entry date', () => {

    FU.buttons.search();
    components.dateInterval.range('02/02/2017', '02/02/2017', 'entry-date');
    FU.modal.submit();
    GU.expectRowCount(gridId, 6 + (2 * depotGroupingRow));

    FU.buttons.search();
    components.dateInterval.range('01/01/2015', '30/01/2015', 'entry-date');
    FU.modal.submit();
    GU.expectRowCount(gridId, 0);

    // clear filters
    FU.buttons.clear();
  });

  it('find lots by expiration date', () => {

    FU.buttons.search();
    components.dateInterval.range('01/01/2017', '31/12/2017', 'expiration-date');
    FU.modal.submit();
    GU.expectRowCount(gridId, 1 + depotGroupingRow);

    // clear filters
    FU.buttons.clear();
  });
}

describe('Stock Lots Registry', StockLotsRegistryTests);
