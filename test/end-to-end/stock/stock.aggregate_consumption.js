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

  it(`Should select the ${DEPOT_TERTIAIRE}`, async () => {
    await page.changeDepot(DEPOT_TERTIAIRE);
  });

  it(`Prevent consumption greater than the quantity available on current depot ${DEPOT_TERTIAIRE}`, async () => {
    const getMovementDate = moment(new Date(), 'YYYY-MM-DD').subtract(60, 'days');
    const getMovementMonth = moment(getMovementDate).month();
    const getMovementYear = moment(getMovementDate).year();

    const month = ['Jan', 'Fév', 'Mars', 'Avr', 'Mai', 'Juin', 'Juill', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];

    const fiscalYearLabel = `Fiscal Year ${getMovementYear}`;

    await page.setFiscalPeriod(fiscalYearLabel, month[getMovementMonth]);
    await page.setDescription(`Aggregate consumption from current depot ${DEPOT_TERTIAIRE}`);

    await page.setHeaderValue(0, 7, 0);
    await page.setQuantityConsumed(1, 5, 2000);
    await page.setQuantityLost(1, 6, 1000);

    await page.setQuantityConsumed(2, 5, 500);
    await page.setQuantityLost(2, 6, 250);

    await page.setHeaderValue(3, 7, 20);
    await page.setQuantityConsumed(4, 5, 1500);
    await page.setQuantityLost(4, 6, 3000);

    await page.submitErrorQuantity();
  });

  it(`Should select the ${DEPOT_TERTIAIRE}`, async () => {
    await page.changeDepot(DEPOT_TERTIAIRE);
  });

  it(`Create a new stock aggregate consumption on current depot ${DEPOT_TERTIAIRE}`, async () => {
    const getMovementDate = moment(new Date(), 'YYYY-MM-DD').subtract(80, 'days');
    const getMovementMonth = moment(getMovementDate).month();
    const getMovementYear = moment(getMovementDate).year();

    const month = ['Jan', 'Fév', 'Mars', 'Avr', 'Mai', 'Juin', 'Juill', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];

    const fiscalYearLabel = `Fiscal Year ${getMovementYear}`;

    await page.setFiscalPeriod(fiscalYearLabel, month[getMovementMonth]);
    await page.setDescription(`Aggregate consumption from current depot ${DEPOT_TERTIAIRE}`);

    await page.setHeaderValue(0, 7, 0);
    await page.setQuantityConsumed(1, 5, 250);
    await page.setQuantityLost(1, 6, 0);

    await page.setQuantityConsumed(2, 5, 250);
    await page.setQuantityLost(2, 6, 0);

    await page.setHeaderValue(3, 7, 0);
    await page.setQuantityConsumed(4, 5, 150);
    await page.setQuantityLost(4, 6, 250);

    // await page.submit();
  });

//   it(`Create a complexe aggregate consumption on current depot ${DEPOT_TERTIAIRE}`, async () => {
//     const getMovementDate = moment(new Date(), 'YYYY-MM-DD').subtract(60, 'days');
//     const getMovementMonth = moment(getMovementDate).month();
//     const getMovementYear = moment(getMovementDate).year();

//     const getLastDays = new Date(getMovementYear, getMovementMonth + 1, 0);

//     const month = ['Jan', 'Fév', 'Mars', 'Avr', 'Mai', 'Juin', 'Juill', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];

//     const fiscalYearLabel = `Fiscal Year ${getMovementYear}`;

//     await page.setFiscalPeriod(fiscalYearLabel, month[getMovementMonth]);
//     await page.setDescription(`Aggregate consumption from current depot ${DEPOT_TERTIAIRE}`);

//     await page.setHeaderValue(0, 7, 5);
//     await page.setQuantityConsumed(1, 5, 500);
//     await page.setQuantityLost(1, 6, 250);

//     const lots = [{
//       date : moment(new Date(getLastDays), 'YYYY-MM-DD').subtract(28, 'days'),
//       quantity_consumed :  0,
//       quantity_lost :  95,
//     }, {
//       date : moment(new Date(getLastDays), 'YYYY-MM-DD').subtract(20, 'days'),
//       quantity_consumed :  0,
//       quantity_lost :  155,
//     }, {
//       date : moment(new Date(getLastDays), 'YYYY-MM-DD').subtract(14, 'days'),
//       quantity_consumed :  225,
//       quantity_lost :  0,
//     }, {
//       date : moment(new Date(getLastDays), 'YYYY-MM-DD').subtract(8, 'days'),
//       quantity_consumed :  125,
//       quantity_lost :  0,
//     }, {
//       date : moment(new Date(getLastDays), 'YYYY-MM-DD').subtract(5, 'days'),
//       quantity_consumed :  150,
//       quantity_lost :  0,
//     }];

//     await page.setDetailed(1, 8);
//     await page.setLotsDetailed(lots);

//     await page.setQuantityConsumed(2, 5, 500);
//     await page.setQuantityLost(2, 6, 250);

//     const lots2 = [{
//       date : moment(new Date(getLastDays), 'YYYY-MM-DD').subtract(12, 'days'),
//       quantity_consumed :  125,
//       quantity_lost :  0,
//     }, {
//       date : moment(new Date(getLastDays), 'YYYY-MM-DD').subtract(4, 'days'),
//       quantity_consumed :  375,
//       quantity_lost :  250,
//     }];

//     await page.setDetailed(2, 8);
//     await page.setLots2Detailed(lots2);

//     await page.setHeaderValue(3, 7, 20);
//     await page.setQuantityConsumed(4, 5, 550);
//     await page.setQuantityLost(4, 6, 50);

//     await page.submit();
//   });
// }

module.exports = StockAggregateConsumptionTests;
