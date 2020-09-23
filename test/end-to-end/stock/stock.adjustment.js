/* global */

const helpers = require('../shared/helpers');
const ExitAdjustment = require('./stock.adjustment.page');

function StockAdjustmentTests() {
  const DEPOT_PRINCIPAL = 'Depot Principal';
  const DESCRIPTION = 'Ajustement de stock';

  // the page object
  const page = new ExitAdjustment();

  // navigate to the page
  before(() => helpers.navigate('#/stock/adjustment'));

  it(`Should select the ${DEPOT_PRINCIPAL}`, () => {
    return page.setDepot(DEPOT_PRINCIPAL);
  });

  it('Should make a positive adjustment ', async () => {
    // select the positive adjustment
    await page.setAdjustment('increase');

    await page.setDate(new Date());

    await page.setDescription(DESCRIPTION.concat(' - Positive'));

    await page.addRows(1);

    // increase the QUININE-A for 20
    await page.setItem(0, 'Quinine', 'QUININE-A', 20);

    // submit
    await page.submit();
  });

  it('Should make a negative adjustment ', async () => {
    // select the negative adjustment
    await page.setAdjustment('decrease');

    await page.setDate(new Date());

    await page.setDescription(DESCRIPTION.concat(' - Negative'));

    await page.addRows(1);

    // increase the QUININE-A for 20
    await page.setItem(0, 'Quinine', 'QUININE-A', 20);

    // submit
    await page.submit();
  });
}

module.exports = StockAdjustmentTests;
