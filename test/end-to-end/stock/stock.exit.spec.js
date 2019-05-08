/* global */

const helpers = require('../shared/helpers');
const ExitPage = require('./stock.exit.page');

function StockExiTests() {
  const DEPOT_PRINCIPAL = 'Depot Principal';
  const DEPOT_SECONDAIRE = 'Depot Secondaire';
  const PATIENT = 'PA.TPA.2';
  const INVOICE = 'IV.TPA.1';
  const SERVICE = 'Medecine Interne';
  const DESCRIPTION = 'Sortie de stock';

  // the page object
  const page = new ExitPage();

  // navigate to the page
  before(() => helpers.navigate('#/stock/exit'));

  it(`Should select the ${DEPOT_PRINCIPAL}`, async () => {
    await page.setDepot(DEPOT_PRINCIPAL);
  });

  it(`Should distribute the stock to the patient ${PATIENT} `, async () => {
    // select the patient
    await page.setPatient(PATIENT);
    await page.setDate(new Date());
    await page.setDescription(DESCRIPTION.concat(' - Patient'));
    await page.addRows(2);

    // first item
    await page.setItem(0, 'Quinine', 'QUININE-A', 20);

    // second item
    await page.setItem(1, 'Multivitamine', 'VITAMINE-A', 10);

    // submit
    await page.submit();
  });

  it(`Should distribute the stock to the patient ${PATIENT} linked with the invoice ${INVOICE} `, async () => {
    // select the patient
    await page.setPatient(PATIENT, INVOICE, true);

    await page.setDate(new Date());

    await page.setDescription(DESCRIPTION.concat(' - Patient'));

    await page.setLot(0, 'QUININE-A');

    // submit
    await page.submit();
  });

  it(`should distribute the stock to the service ${SERVICE} `, async () => {
    // select the service
    await page.setService(SERVICE);

    await page.setDate(new Date());

    await page.setDescription(DESCRIPTION.concat(' - Service'));

    await page.addRows(2);

    // first item
    await page.setItem(0, 'Quinine', 'QUININE-B', 25);

    // second item
    await page.setItem(1, 'Multivitamine', 'VITAMINE-B', 5);

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
    await page.setItem(0, 'Quinine', 'QUININE-B', 75);

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
    await page.setItem(0, 'Multivitamine', 'VITAMINE-B', 5);

    // submit
    await page.submit();
  });
}

describe('Stock Exit Test', StockExiTests);
