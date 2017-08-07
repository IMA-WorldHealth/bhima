/* global element, by, browser */
'use strict';

const FU = require('../shared/FormUtils');
const GU = require('../shared/GridUtils');
const helpers = require('../shared/helpers');
const components = require('../shared/components');

function StockMovementsRegistryTests() {

  // navigate to the page
  before(() => helpers.navigate('#/stock/movements'));

  const gridId = 'stock-movements-grid';

  const depotGroupingRow = 1;

  it('find entry/exit movements', () => {

    // entry movements
    FU.buttons.search();
    FU.radio('$ctrl.bundle.is_exit', 0);
    FU.modal.submit();
    GU.expectRowCount(gridId, 15 + (2 * depotGroupingRow));

    // exit movements
    FU.buttons.search();
    FU.radio('$ctrl.bundle.is_exit', 1);
    FU.modal.submit();
    GU.expectRowCount(gridId, 7 + depotGroupingRow);

    // clear filters
    FU.buttons.clear();
  });

  it('find movements by depot', () => {

    FU.buttons.search();
    FU.uiSelect('$ctrl.bundle.depot_uuid', 'Depot Secondaire');
    FU.modal.submit();
    GU.expectRowCount(gridId, 6 + depotGroupingRow);

    FU.buttons.search();
    FU.uiSelect('$ctrl.bundle.depot_uuid', 'Depot Principal');
    FU.modal.submit();
    GU.expectRowCount(gridId, 16 + depotGroupingRow);

    // clear filters
    FU.buttons.clear();
  });

  it('find movements by inventory', () => {

    FU.buttons.search();
    FU.uiSelect('$ctrl.bundle.inventory_uuid', 'First Test Inventory Item');
    FU.modal.submit();
    GU.expectRowCount(gridId, 14 + (2 * depotGroupingRow));

    // clear filters
    FU.buttons.clear();
  });


  it('find movements by lot name', () => {

    FU.buttons.search();
    FU.input('$ctrl.bundle.label', 'VITAMINE-A');
    FU.modal.submit();
    GU.expectRowCount(gridId, 2 + depotGroupingRow);

    // clear filters
    FU.buttons.clear();
  });

  it('find by lots reasons', () => {
    // FIXME: reasons must not depend on translations
    //        selection with `id` works but it is not completed

    // from purchase  
    FU.buttons.search();
    FU.uiSelect('$ctrl.bundle.flux_id', 'Commande d\'achat');
    FU.modal.submit();
    GU.expectRowCount(gridId, 2 + depotGroupingRow);

    // to patient 
    FU.buttons.search();
    FU.uiSelect('$ctrl.bundle.flux_id', 'Vers un patient');
    FU.modal.submit();
    GU.expectRowCount(gridId, 2 + depotGroupingRow);

    // to depot 
    FU.buttons.search();
    FU.uiSelect('$ctrl.bundle.flux_id', 'Vers un depot');
    FU.modal.submit();
    GU.expectRowCount(gridId, 1 + depotGroupingRow);

    // from depot
    FU.buttons.search();
    FU.uiSelect('$ctrl.bundle.flux_id', 'En provenance d\'un depot');
    FU.modal.submit();
    GU.expectRowCount(gridId, 1 + depotGroupingRow);

    // positive adjustment
    FU.buttons.search();
    FU.uiSelect('$ctrl.bundle.flux_id', 'Ajustement (Positif)');
    FU.modal.submit();
    GU.expectRowCount(gridId, 1 + depotGroupingRow);

    // negative adjustment
    FU.buttons.search();
    FU.uiSelect('$ctrl.bundle.flux_id', 'Ajustement (Negatif)');
    FU.modal.submit();
    GU.expectRowCount(gridId, 1 + depotGroupingRow);

    // clear filters
    FU.buttons.clear();
  });

  it('find lots by date - Fev 2017', () => {

    FU.buttons.search();
    components.dateInterval.range('02/02/2017', '02/02/2017');
    FU.modal.submit();
    GU.expectRowCount(gridId, 5 + depotGroupingRow);

    FU.buttons.search();
    components.dateInterval.range('01/01/2015', '30/01/2015');
    FU.modal.submit();
    GU.expectRowCount(gridId, 0);

    // clear filters
    FU.buttons.clear();
  });
}

describe('Stock Movement Registry', StockMovementsRegistryTests);
