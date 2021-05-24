/* global */
const moment = require('moment');
const helpers = require('../shared/helpers');
const Page = require('./stock.aggregate_consumption.page');

function StockAggregateConsumptionTests() {
  // let modal;
  let page;

  // actions before each tests
  beforeEach(beforeEachActions);

  function beforeEachActions() {
    page = new Page();
    helpers.navigate('#/stock/aggregated_consumption');
  }

  const DEPOT_TERTIAIRE = 'Depot Tertiaire';
  const DEPOT_PRINCIPAL = 'Depot Principal';

  const month = ['Jan', 'Fév', 'Mars', 'Avr', 'Mai', 'Juin', 'Juill', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];

  it(`Should select the ${DEPOT_TERTIAIRE}`, async () => {
    await page.changeDepot(DEPOT_TERTIAIRE);
  });

  it(`Prevent consumption greater than the quantity available on current depot ${DEPOT_TERTIAIRE}`, async () => {
    const getMovementDate = moment(new Date(), 'YYYY-MM-DD').subtract(60, 'days');
    const getMovementMonth = moment(getMovementDate).month();
    const getMovementYear = moment(getMovementDate).year();

    const fiscalYearLabel = `Fiscal Year ${getMovementYear}`;

    await page.setFiscalPeriod(fiscalYearLabel, month[getMovementMonth]);
    await page.setDescription(`Aggregate consumption from current depot ${DEPOT_TERTIAIRE}`);

    await page.setHeaderValue(0, 9, 0);
    await page.setQuantityConsumed(1, 7, 2000);
    await page.setQuantityLost(1, 8, 1000);

    await page.setQuantityConsumed(2, 7, 500);
    await page.setQuantityLost(2, 8, 250);

    await page.setHeaderValue(3, 9, 20);
    await page.setQuantityConsumed(4, 7, 1500);
    await page.setQuantityLost(4, 8, 3000);

    await page.submitErrorQuantity();
  });

  it(`Should select the ${DEPOT_TERTIAIRE}`, async () => {
    await page.changeDepot(DEPOT_TERTIAIRE);
  });

  it(`Create a new stock aggregate consumption on current depot ${DEPOT_TERTIAIRE}`, async () => {
    const getMovementDate = moment(new Date(), 'YYYY-MM-DD').subtract(80, 'days');
    const getMovementMonth = moment(getMovementDate).month();
    const getMovementYear = moment(getMovementDate).year();

    const fiscalYearLabel = `Fiscal Year ${getMovementYear}`;

    await page.setFiscalPeriod(fiscalYearLabel, month[getMovementMonth]);
    await page.setDescription(`Aggregate consumption from current depot ${DEPOT_TERTIAIRE}`);

    await page.setHeaderValue(0, 9, 0);
    await page.setQuantityConsumed(1, 7, 250);
    await page.setQuantityLost(1, 8, 0);

    await page.setQuantityConsumed(2, 7, 250);
    await page.setQuantityLost(2, 8, 0);

    await page.setHeaderValue(3, 9, 0);
    await page.setQuantityConsumed(4, 7, 150);
    await page.setQuantityLost(4, 8, 250);

    await page.submit();
  });

  it(`Create a complexe aggregate consumption on current depot ${DEPOT_TERTIAIRE}`, async () => {
    const getMovementDate = moment(new Date(), 'YYYY-MM-DD').subtract(60, 'days');
    const getMovementMonth = moment(getMovementDate).month();
    const getMovementYear = moment(getMovementDate).year();

    const getLastDays = new Date(getMovementYear, getMovementMonth + 1, 0);

    const fiscalYearLabel = `Fiscal Year ${getMovementYear}`;

    await page.setFiscalPeriod(fiscalYearLabel, month[getMovementMonth]);
    await page.setDescription(`Aggregate consumption from current depot ${DEPOT_TERTIAIRE}`);

    await page.setHeaderValue(0, 9, 5);
    await page.setQuantityConsumed(1, 7, 500);
    await page.setQuantityLost(1, 8, 250);

    const lots = [{
      start_date : moment(new Date(getLastDays), 'YYYY-MM-DD').subtract(27, 'days'),
      end_date : moment(new Date(getLastDays), 'YYYY-MM-DD').subtract(25, 'days'),
      quantity_consumed :  0,
      quantity_lost :  95,
    }, {
      start_date : moment(new Date(getLastDays), 'YYYY-MM-DD').subtract(20, 'days'),
      end_date : moment(new Date(getLastDays), 'YYYY-MM-DD').subtract(18, 'days'),
      quantity_consumed :  0,
      quantity_lost :  155,
    }, {
      start_date : moment(new Date(getLastDays), 'YYYY-MM-DD').subtract(14, 'days'),
      end_date : moment(new Date(getLastDays), 'YYYY-MM-DD').subtract(12, 'days'),
      quantity_consumed :  225,
      quantity_lost :  0,
    }, {
      start_date : moment(new Date(getLastDays), 'YYYY-MM-DD').subtract(10, 'days'),
      end_date : moment(new Date(getLastDays), 'YYYY-MM-DD').subtract(8, 'days'),
      quantity_consumed :  125,
      quantity_lost :  0,
    }, {
      start_date : moment(new Date(getLastDays), 'YYYY-MM-DD').subtract(6, 'days'),
      end_date : moment(new Date(getLastDays), 'YYYY-MM-DD').subtract(4, 'days'),
      quantity_consumed :  150,
      quantity_lost :  0,
    }];

    await page.setDetailed(1, 10);
    await page.setLotsDetailed(lots);

    await page.setQuantityConsumed(2, 7, 500);
    await page.setQuantityLost(2, 8, 250);

    const lots2 = [{
      start_date : moment(new Date(getLastDays), 'YYYY-MM-DD').subtract(20, 'days'),
      end_date : moment(new Date(getLastDays), 'YYYY-MM-DD').subtract(18, 'days'),
      quantity_consumed :  125,
      quantity_lost :  0,
    }, {
      start_date : moment(new Date(getLastDays), 'YYYY-MM-DD').subtract(14, 'days'),
      end_date : moment(new Date(getLastDays), 'YYYY-MM-DD').subtract(10, 'days'),
      quantity_consumed :  375,
      quantity_lost :  250,
    }];

    await page.setDetailed(2, 10);
    await page.setLots2Detailed(lots2);

    await page.setHeaderValue(3, 9, 20);
    await page.setQuantityConsumed(4, 7, 550);
    await page.setQuantityLost(4, 8, 50);

    await page.submit();
  });

  it(`Should select the ${DEPOT_PRINCIPAL}`, async () => {
    await page.changeDepot(DEPOT_PRINCIPAL);
  });

  it(`Prevent that for an aggregated consume the start date is greater than the end date
    ${DEPOT_PRINCIPAL}`, async () => {
    const getMovementDate = moment(new Date(), 'YYYY-MM-DD').subtract(60, 'days');
    const getMovementMonth = moment(getMovementDate).month();
    const getMovementYear = moment(getMovementDate).year();

    const getLastDays = new Date(getMovementYear, getMovementMonth + 1, 0);

    const fiscalYearLabel = `Fiscal Year ${getMovementYear}`;

    await page.setFiscalPeriod(fiscalYearLabel, month[getMovementMonth]);
    await page.setDescription(`Aggregate consumption from current depot ${DEPOT_PRINCIPAL}`);

    await page.setHeaderValue(0, 9, 5);
    await page.setQuantityConsumed(1, 7, 15);
    await page.setQuantityLost(1, 8, 5);

    const lots = [{
      start_date : moment(new Date(getLastDays), 'YYYY-MM-DD').subtract(3, 'days'),
      end_date : moment(new Date(getLastDays), 'YYYY-MM-DD').subtract(10, 'days'),
      quantity_consumed :  15,
      quantity_lost : 5,
    }];

    await page.setDetailed(1, 10);
    await page.setLots3Detailed(lots);
  });

  it(`Should select the ${DEPOT_PRINCIPAL}`, async () => {
    await page.changeDepot(DEPOT_PRINCIPAL);
  });

  it(`Prevent dates from being in bad period ${DEPOT_PRINCIPAL}`, async () => {
    const getMovementDate = moment(new Date(), 'YYYY-MM-DD').subtract(60, 'days');
    const getMovementMonth = moment(getMovementDate).month();
    const getMovementYear = moment(getMovementDate).year();

    const getLastDays = new Date(getMovementYear, getMovementMonth + 1, 0);

    const fiscalYearLabel = `Fiscal Year ${getMovementYear}`;

    await page.setFiscalPeriod(fiscalYearLabel, month[getMovementMonth]);
    await page.setDescription(`Aggregate consumption from current depot ${DEPOT_PRINCIPAL}`);

    await page.setHeaderValue(0, 9, 5);
    await page.setQuantityConsumed(1, 7, 15);
    await page.setQuantityLost(1, 8, 5);

    const lots = [{
      start_date : moment(new Date(getLastDays), 'YYYY-MM-DD').subtract(25, 'days'),
      end_date : moment(new Date(getLastDays), 'YYYY-MM-DD').subtract(12, 'days'),
      quantity_consumed :  10,
      quantity_lost : 3,
    }, {
      start_date : moment(new Date(getLastDays), 'YYYY-MM-DD').subtract(10, 'days'),
      end_date : moment(new Date(getLastDays), 'YYYY-MM-DD').subtract(35, 'days'),
      quantity_consumed :  5,
      quantity_lost : 2,
    }];

    await page.setDetailed(1, 10);
    await page.setLots4Detailed(lots);
  });

  it(`Should select the ${DEPOT_PRINCIPAL}`, async () => {
    await page.changeDepot(DEPOT_PRINCIPAL);
  });

  it(`Prevent that it may have aggregate consumption with incorrect date ranges ${DEPOT_PRINCIPAL}`, async () => {
    const getMovementDate = moment(new Date(), 'YYYY-MM-DD').subtract(60, 'days');
    const getMovementMonth = moment(getMovementDate).month();
    const getMovementYear = moment(getMovementDate).year();

    const getLastDays = new Date(getMovementYear, getMovementMonth + 1, 0);

    const fiscalYearLabel = `Fiscal Year ${getMovementYear}`;

    await page.setFiscalPeriod(fiscalYearLabel, month[getMovementMonth]);
    await page.setDescription(`Aggregate consumption from current depot ${DEPOT_PRINCIPAL}`);

    await page.setHeaderValue(0, 9, 5);
    await page.setQuantityConsumed(1, 7, 15);
    await page.setQuantityLost(1, 8, 5);

    const lots = [{
      start_date : moment(new Date(getLastDays), 'YYYY-MM-DD').subtract(15, 'days'),
      end_date : moment(new Date(getLastDays), 'YYYY-MM-DD').subtract(10, 'days'),
      quantity_consumed :  10,
      quantity_lost : 3,
    }, {
      start_date : moment(new Date(getLastDays), 'YYYY-MM-DD').subtract(17, 'days'),
      end_date : moment(new Date(getLastDays), 'YYYY-MM-DD').subtract(8, 'days'),
      quantity_consumed :  5,
      quantity_lost : 2,
    }];

    await page.setDetailed(1, 10);
    await page.setLots4Detailed(lots);
  });

  it(`Should select the ${DEPOT_PRINCIPAL}`, async () => {
    await page.changeDepot(DEPOT_PRINCIPAL);
  });

  it(`Prevent that we consume quantities greater than those defined ${DEPOT_PRINCIPAL}`, async () => {
    const getMovementDate = moment(new Date(), 'YYYY-MM-DD').subtract(60, 'days');
    const getMovementMonth = moment(getMovementDate).month();
    const getMovementYear = moment(getMovementDate).year();

    const getLastDays = new Date(getMovementYear, getMovementMonth + 1, 0);

    const fiscalYearLabel = `Fiscal Year ${getMovementYear}`;

    await page.setFiscalPeriod(fiscalYearLabel, month[getMovementMonth]);
    await page.setDescription(`Aggregate consumption from current depot ${DEPOT_PRINCIPAL}`);

    await page.setHeaderValue(0, 9, 5);
    await page.setQuantityConsumed(1, 7, 15);
    await page.setQuantityLost(1, 8, 5);

    const lots = [{
      start_date : moment(new Date(getLastDays), 'YYYY-MM-DD').subtract(15, 'days'),
      end_date : moment(new Date(getLastDays), 'YYYY-MM-DD').subtract(10, 'days'),
      quantity_consumed :  10,
      quantity_lost : 33,
    }, {
      start_date : moment(new Date(getLastDays), 'YYYY-MM-DD').subtract(10, 'days'),
      end_date : moment(new Date(getLastDays), 'YYYY-MM-DD').subtract(8, 'days'),
      quantity_consumed :  15,
      quantity_lost : 2,
    }];

    await page.setDetailed(1, 10);
    await page.setLots4Detailed(lots);
  });

  // Fixe Me : lomamech 2021-05-24
  // You will need to provide data in the test database to be able
  // to perform this test with the current data the repositories are empty

  // it(`Should select the ${DEPOT_TERTIAIRE}`, async () => {
  //   await page.changeDepot(DEPOT_TERTIAIRE);
  // });

  // it(`Prevent negative stock quantities when Aggregate Consumption greater than the
  //     quantity available on current depot ${DEPOT_TERTIAIRE}`, async () => {
  //   const getMovementDate = moment(new Date(), 'YYYY-MM-DD').subtract(80, 'days');
  //   const getMovementMonth = moment(getMovementDate).month();
  //   const getMovementYear = moment(getMovementDate).year();

  //   const fiscalYearLabel = `Fiscal Year ${getMovementYear}`;

  //   await page.setFiscalPeriod(fiscalYearLabel, month[getMovementMonth]);
  //   await page.setDescription(`Aggregate consumption from current depot ${DEPOT_TERTIAIRE}`);

  //   await page.setHeaderValue(0, 9, 0);
  //   await page.setQuantityConsumed(1, 7, 300);
  //   await page.setQuantityLost(1, 8, 200);

  //   await page.setQuantityConsumed(2, 7, 100);
  //   await page.setQuantityLost(2, 8, 200);

  //   await page.setHeaderValue(3, 9, 20);
  //   await page.setQuantityConsumed(4, 7, 400);
  //   await page.setQuantityLost(4, 8, 300);

  //   await page.submitErrorQuantity();
  // });
}

module.exports = StockAggregateConsumptionTests;
