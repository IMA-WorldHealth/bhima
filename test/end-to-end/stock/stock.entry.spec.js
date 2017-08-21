/* global element, by, browser */

const helpers = require('../shared/helpers');
const EntryPage = require('./stock.entry.page');

function StockExiTests() {
  const DEPOT_PRINCIPAL = 'Depot Principal';
  const DEPOT_SECONDAIRE = 'Depot Secondaire';
  const DESCRIPTION = 'Entree de stock';

  // the page object
  const page = new EntryPage();

  // navigate to the page
  before(() => helpers.navigate('#/stock/entry'));

  it(`Should select the ${DEPOT_PRINCIPAL} `, () => {
    page.setDepot(DEPOT_PRINCIPAL);
  });

  it('Should entry stock from a purchase order', () => {
    // select the purchase order
    page.setPurchase(0);

    page.setDate(new Date());

    page.setDescription(DESCRIPTION.concat(' - Purchase order'));

    const lots = [
      { label: 'LX-ONE', quantity: 500, expiration_date: '2020-12-31' },
      { label: 'LX-TWO', quantity: 300, expiration_date: '2019-06-15' },
      { label: 'LX-THREE', quantity: 200, expiration_date: '2018-09-15' },
    ];

    page.setLots(0, lots, false);

    // submit
    page.submit();
  });

  it(`Should entry stock in ${DEPOT_SECONDAIRE} from an integration`, () => {
    // set another Depot
    page.setDepot(DEPOT_SECONDAIRE);

    // select the integration option
    page.setIntegration();

    page.setDate(new Date());

    page.setDescription(DESCRIPTION.concat(' - Integration de stock'));

    const lots = [
      { label: 'ASP-ONE', quantity: 100, expiration_date: '2020-12-31' },
      { label: 'ASP-TWO', quantity: 200, expiration_date: '2019-06-15' },
      { label: 'ASP-THREE', quantity: 300, expiration_date: '2018-09-15' },
      { label: 'ASP-FOUR', quantity: 400, expiration_date: '2018-09-15' },
      { label: 'ASP-FIVE', quantity: 500, expiration_date: '2022-09-15' },
    ];

    page.addRows(1);

    page.setItem(0, 'INV0');

    page.setLots(0, lots, false, 1500, 0.09);

    // submit
    page.submit();
  });

  it('Should entry stock from a transfer reception', () => {
    // select the movement
    page.setTransfer(0);

    page.setDate(new Date());

    page.setDescription(DESCRIPTION.concat(' - Transfer reception'));

    const lots = [
      { quantity: 75},
    ];

    page.setLots(0, lots, true);

    // submit
    page.submit();
  });
}

describe('Stock Entry Test', StockExiTests);
