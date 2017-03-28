/* global element, by, browser */

const helpers = require('../shared/helpers');
const ExitPage = require('./stock.exit.page');

function StockExiTests() {
  const DEPOT_PRINCIPAL = 'Depot Principal';
  const PATIENT = 'PA.TPA.2';
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

    page.setDescription('Sortie de stock vers patient');

    page.addRows(2);
  });
}

describe.only('Stock Exit Test', StockExiTests);
