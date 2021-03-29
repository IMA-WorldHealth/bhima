/* global */

// const EC = require('protractor').ExpectedConditions;
const moment = require('moment');
const helpers = require('../shared/helpers');
const ExitPage = require('./stock.exit.page');

function StockExiTests() {
  const DEPOT_PRINCIPAL = 'Depot Principal';
  const DEPOT_SECONDAIRE = 'Depot Secondaire';
  const PATIENT = 'PA.TPA.2';
  const INVOICE = 'IV.TPA.1';
  const SERVICE = 'Medecine Interne';
  const DESCRIPTION = 'Sortie de stock';

  const requisitionService = {
    service : 'Test Service',
    reference : 'SREQ.TPA.1',
  };

  const requisitionDepot = {
    depot : 'Depot Secondaire',
    reference : 'SREQ.TPA.2',
  };

  const preventRequisitionDepot = {
    depot : 'Depot Tertiaire',
    reference : 'SREQ.TPA.3',
    className : 'label label-danger',
  };

  const preventRequisitionDepot2 = {
    depot : 'Depot Tertiaire',
    reference : 'SREQ.TPA.4',
    className : 'label label-warning',
  };

  const preventRequisitionDepot3 = {
    depot : 'Depot Secondaire',
    reference : 'SREQ.TPA.2',
    className : 'label label-success',
  };

  // the page object
  const page = new ExitPage();

  // navigate to the page
  before(() => helpers.navigate('#/stock/exit'));

  it(`should select the ${DEPOT_PRINCIPAL}`, async () => {
    await page.setDepot(DEPOT_PRINCIPAL);
  });

  it(`should distribute the stock to the patient ${PATIENT} `, async () => {
    // select the patient
    await page.setPatient(PATIENT);

    await page.setDate(new Date());
    await page.setDescription(DESCRIPTION.concat(' - Patient'));
    await page.addRows(2);

    // first item
    await page.setItem(0, 'Quinine', 'QUININE-C', 20);

    // second item
    await page.setItem(1, 'Vitamines', 'VITAMINE-A', 10);

    // submit
    await page.submit();
  });

  it(`should distribute the stock to the patient ${PATIENT} linked with the invoice ${INVOICE} `, async () => {
    await page.setDate(new Date());

    // select the patient
    await page.setPatient(PATIENT, INVOICE);

    await page.setDescription(DESCRIPTION.concat(' - Patient'));

    await page.setLot(0, 'QUININE-B');

    // submit
    await page.submit();
  });

  it(`Should Prevent negative stock quantities when distribute the stock to the patient ${PATIENT} `, async () => {
    const movementDate = moment(new Date(), 'YYYY-MM-DD').subtract(1, 'days');

    // select the patient
    await page.setPatient(PATIENT);
    await page.setDate(new Date(movementDate));
    await page.setDescription(DESCRIPTION.concat(' - Patient'));
    await page.addRows(2);

    // first item
    await page.setItem(0, 'Quinine', 'QUININE-C', 40);

    // second item
    await page.setItem(1, 'Vitamines', 'VITAMINE-A', 10);

    // submit
    await page.submitError();
  });

  it(`should distribute the stock to the service ${SERVICE} `, async () => {
    // select the service
    await page.setService(SERVICE);

    await page.setDate(new Date());

    await page.setDescription(DESCRIPTION.concat(' - Service'));

    await page.addRows(2);

    // first item
    await page.setItem(0, 'Quinine', 'QUININE-B', 8);

    // second item
    await page.setItem(1, 'Vitamines', 'VITAMINE-B', 5);

    // submit
    await page.submit();
  });

  it(`should distribute the stock to the depot ${DEPOT_SECONDAIRE} `, async () => {
    // select the depot of destination
    await page.setDestinationDepot(DEPOT_SECONDAIRE);

    await page.setDate(new Date());

    await page.setDescription(DESCRIPTION.concat(' - Depot'));

    await page.addRows(1);

    // first item
    await page.setItem(0, 'Quinine', 'QUININE-C', 20);

    // submit
    await page.submit();
  });

  it('should distribute the stock as a loss ', async () => {
    // select the depot of destination
    await page.setLoss();

    await page.setDate(new Date());

    await page.setDescription(DESCRIPTION.concat(' - Loss'));

    await page.addRows(1);

    // first item
    await page.setItem(0, 'Vitamines', 'VITAMINE-B', 5);

    // submit
    await page.submit();
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

    await page.setLot(0, 'VITAMINE-A');

    // submit
    await page.submit();
  });

  it(`Prevent out of stock for a cancelled requisition`, async () => {
    await page.setDate(new Date());
    await page.setDescription(DESCRIPTION.concat(' - Depot'));

    // select the depot
    await page.preventDepotRequisition(preventRequisitionDepot);
  });

  it(`should select the ${DEPOT_PRINCIPAL}`, async () => {
    await page.setDepot(DEPOT_PRINCIPAL);
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

module.exports = StockExiTests;
