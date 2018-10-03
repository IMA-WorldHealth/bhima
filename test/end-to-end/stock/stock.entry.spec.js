const moment = require('moment');
const helpers = require('../shared/helpers');
const EntryPage = require('./stock.entry.page');

function StockEntryTests() {
  const DEPOT_PRINCIPAL = 'Depot Principal';
  const DEPOT_SECONDAIRE = 'Second';
  const DESCRIPTION = 'Entree de stock';

  const expireInOneYear = moment().add(1, 'year').format('YYYY-MM-DD');
  const expireInTwoYears = moment().add(2, 'year').format('YYYY-MM-DD');
  const expireInThreeYears = moment().add(3, 'year').format('YYYY-MM-DD');

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
      { label : 'LX-ONE', quantity : 500, expiration_date : expireInThreeYears },
      { label : 'LX-TWO', quantity : 300, expiration_date : expireInTwoYears },
      { label : 'LX-THREE', quantity : 200, expiration_date : expireInOneYear },
    ];

    page.setLots(0, lots, false);

    // submit
    page.submit();
  });

  it(`Should entry stock in ${DEPOT_SECONDAIRE} from an integration`, function t() {
    this.timeout(60000);

    // set another Depot
    page.setDepot(DEPOT_SECONDAIRE);

    // select the integration option
    page.setIntegration();

    page.setDate(new Date());

    page.setDescription(DESCRIPTION.concat(' - Integration de stock'));

    page.addRows(1);

    const lots = [
      { label : 'ASP-ONE', quantity : 100, expiration_date : expireInThreeYears },
      { label : 'ASP-TWO', quantity : 200, expiration_date : expireInTwoYears },
      { label : 'ASP-THREE', quantity : 300, expiration_date : expireInOneYear },
      { label : 'ASP-FOUR', quantity : 400, expiration_date : expireInOneYear },
      { label : 'ASP-FIVE', quantity : 500, expiration_date : expireInThreeYears },
    ];

    page.setItem(0, 'Quinine');

    page.setLots(0, lots, false, 1500, 0.09);

    // submit
    page.submit();
  });

  it('Should entry stock from a transfer reception', () => {
    // set another Depot
    page.setDepot(DEPOT_SECONDAIRE);

    // select the movement
    page.setTransfer(0);

    page.setDate(new Date());

    page.setDescription(DESCRIPTION.concat(' - Transfer reception'));

    const lots = [
      { quantity : 75 },
    ];

    page.setLots(0, lots, true);

    // submit
    page.submit();
  });

  it(`Should add automatically new lot row when fast insert is enabled`, () => {
    // set another Depot
    page.setDepot(DEPOT_SECONDAIRE);

    // select the integration option
    page.setIntegration();

    page.setDate(new Date());

    page.setDescription(DESCRIPTION.concat(' - Integration de stock'));

    page.addRows(1);

    page.setItem(0, 'Quinine');

    page.openLotsModal(0);

    page.enableFastLotsInsert();

    const lots = ['AAA', 'BBB', 'CCC'];
    page.fastLotsInsert(lots);
  });
}

describe('Stock Entry Test', StockEntryTests);
