/* global element, by, browser */
'use strict';

const FU = require('../shared/FormUtils');
const GU = require('../shared/GridUtils');
const helpers = require('../shared/helpers');
const components = require('../shared/components');

function StockLotsRegistryTests() {

  // navigate to the page
  before(() => helpers.navigate('#/stock/lots'));

  const LOTS_INSIDE_REGISTRY = 12;
  const gridId = 'stock-lots-grid';

  it('find lots by depot', () => {

    FU.buttons.search();
    FU.uiSelect('$ctrl.bundle.depot_uuid', 'Depot Secondaire');
    FU.modal.submit();
    GU.expectRowCount(gridId, 2);

    FU.buttons.search();
    FU.uiSelect('$ctrl.bundle.depot_uuid', 'Depot Principal');
    FU.modal.submit();
    GU.expectRowCount(gridId, 10);

    // clear filters
    FU.buttons.clear();
  });

  it('find lots by inventory', () => {

    FU.buttons.search();
    FU.uiSelect('$ctrl.bundle.inventory_uuid', 'First Test Inventory Item');
    FU.modal.submit();
    GU.expectRowCount(gridId, 7);

    // clear filters
    FU.buttons.clear();
  });


  it('find purchase by user', () => {

    FU.buttons.search();
    FU.input('$ctrl.bundle.label', 'VITAMINE-A');
    FU.modal.submit();
    GU.expectRowCount(gridId, 2);

    // clear filters
    FU.buttons.clear();
  });

}

describe.only('Stock Lots Registry', StockLotsRegistryTests);
