/* global */

// const EC = require('protractor').ExpectedConditions;
const helpers = require('../shared/helpers');
const ExitPage = require('./stock.exit.page');

function StockExiTests() {
  const DEPOT_PRINCIPAL = 'Depot Principal';
  const DEPOT_SECONDAIRE = 'Depot Secondaire';

  const DESCRIPTION = 'Sortie de stock';

  const requisitionService = {
    service : 'Test Service',
    reference : 'SREQ.2',
  };

  const requisitionDepot = {
    depot : 'Depot Secondaire',
    reference : 'SREQ.3',
  };

  const preventRequisitionDepot = {
    depot : 'Depot Tertiaire',
    reference : 'SREQ.4',
    className : 'label label-danger',
  };

  const preventRequisitionDepot2 = {
    depot : 'Depot Tertiaire',
    reference : 'SREQ.5',
    className : 'label label-warning',
  };

  const preventRequisitionDepot3 = {
    depot : 'Depot Secondaire',
    reference : 'SREQ.3',
    className : 'label label-success',
  };

  // the page object
  const page = new ExitPage();

  // navigate to the page
  before(() => helpers.navigate('#/stock/exit'));

  it(`should select the ${DEPOT_PRINCIPAL}`, async () => {
    await page.setDepot(DEPOT_PRINCIPAL);
  });

  it(`should Partial distribute the stock to the depot From Requisition `, async () => {
    await page.setDate(new Date());
    await page.setDescription(DESCRIPTION.concat(' - Depot'));

    // select the depot
    await page.setDepotRequisition(requisitionDepot);

    // first item
    await page.setLot(0, 'QUININE-B', 2);

    // second item
    await page.setLot(1, 'X-ONE');

    // submit
    await page.submit();
  });

  it(`should select the ${DEPOT_SECONDAIRE}`, async () => {
    await page.setDepot(DEPOT_SECONDAIRE);
  });

  it(`should distribute the stock to the service ${requisitionService.service} From Requisition `, async () => {
    await page.setDate(new Date());

    // select the service
    await page.setServiceRequisition(requisitionService);

    await page.setDescription(DESCRIPTION.concat(' - Service'));

    // first item
    await page.setLot(0, 'ASP-THREE');

    // second item
    await page.setLot(1, 'VITAMINE-A');

    // submit
    await page.submit();
  });

  it(`Prevent out of stock for a cancelled requisition`, async () => {
    await page.setDate(new Date());
    await page.setDescription(DESCRIPTION.concat(' - Depot'));

    // select the depot
    await page.preventDepotRequisition(preventRequisitionDepot);
  });

  it(`Prevent out of stock for a requisition from another warehouse `, async () => {
    await page.setDate(new Date());
    await page.setDescription(DESCRIPTION.concat(' - Depot'));

    // select the depot
    await page.preventDepotRequisition(preventRequisitionDepot2);
  });

  it(`should Complete distribute stock to the depot From Requisition `, async () => {
    await page.setDate(new Date());
    await page.setDescription(DESCRIPTION.concat(' - Depot'));

    // select the depot
    await page.setDepotRequisition(requisitionDepot);

    // first item
    await page.setLot(0, 'QUININE-C', 2);

    // submit
    await page.submit();
  });

  it(`Prevent out of stock for a complete requisition from another warehouse `, async () => {
    await page.setDate(new Date());
    await page.setDescription(DESCRIPTION.concat(' - Depot'));

    // select the depot
    await page.preventDepotRequisition(preventRequisitionDepot3);
  });

}

describe('Test Exit Stock from Requisition', StockExiTests);
