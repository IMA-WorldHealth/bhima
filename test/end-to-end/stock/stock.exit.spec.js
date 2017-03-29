/* global element, by, browser */

const helpers = require('../shared/helpers');
const ExitPage = require('./stock.exit.page');

function StockExiTests() {
  const DEPOT_PRINCIPAL = 'Depot Principal';
  const DEPOT_SECONDAIRE = 'Depot Secondaire';
  const PATIENT = 'PA.TPA.2';
  const SERVICE = 'Medecine Interne';
  const DESCRIPTION = 'Sortie de stock';

  // the page object
  const page = new ExitPage();

  // navigate to the page
  before(() => helpers.navigate('#/stock/exit'));

  it(`Should select the ${DEPOT_PRINCIPAL} `, () => {
    page.setDepot(DEPOT_PRINCIPAL);
  });

  it(`Should distribute the stock to the patient ${PATIENT} `, () => {
    // select the patient
    page.setPatient(PATIENT);

    page.setDate(new Date());

    page.setDescription(DESCRIPTION.concat(' - Patient'));

    page.addRows(2);

    // first item
    page.setItem(0, 'INV0', 'QUININE-A', 20);

    // second item
    page.setItem(1, 'INV1', 'VITAMINE-A', 10);

    // submit
    page.submit();
  });

  it(`Should distribute the stock to the service ${SERVICE} `, () => {
    // select the service
    page.setService(SERVICE);

    page.setDate(new Date());

    page.setDescription(DESCRIPTION.concat(' - Service'));

    page.addRows(2);

    // first item
    page.setItem(0, 'INV0', 'QUININE-B', 25);

    // second item
    page.setItem(1, 'INV1', 'VITAMINE-B', 5);

    // submit
    page.submit();
  });

  it(`Should distribute the stock to the depot ${DEPOT_SECONDAIRE} `, () => {
    // select the depot of destination
    page.setDestinationDepot(DEPOT_SECONDAIRE);

    page.setDate(new Date());

    page.setDescription(DESCRIPTION.concat(' - Depot'));

    page.addRows(1);

    // first item
    page.setItem(0, 'INV0', 'QUININE-B', 75);

    // submit
    page.submit();
  });

  it('Should distribute the stock as a lost ', () => {
    // select the depot of destination
    page.setLoss();

    page.setDate(new Date());

    page.setDescription(DESCRIPTION.concat(' - Loss'));

    page.addRows(1);

    // first item
    page.setItem(0, 'INV1', 'VITAMINE-B', 5);

    // submit
    page.submit();
  });
}

describe('Stock Exit Test', StockExiTests);
