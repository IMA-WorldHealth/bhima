/* global element, by, browser */

const helpers = require('../shared/helpers');
const ExitAdjustment = require('./stock.adjustment.page');

function StockAdjustmentTests() {
  const DEPOT_PRINCIPAL = 'Depot Principal';
  const DESCRIPTION = 'Ajustement de stock';

  // the page object
  const page = new ExitAdjustment();

  // navigate to the page
  before(() => helpers.navigate('#/stock/adjustment'));

  it(`Should select the ${DEPOT_PRINCIPAL} `, () => {
    page.setDepot(DEPOT_PRINCIPAL);
  });

  it('Should make a positive adjustment ', () => {
    // select the positive adjustment
    page.setAdjustment(0);

    page.setDate(new Date());

    page.setDescription(DESCRIPTION.concat(' - Positive'));

    page.addRows(1);

    // increase the QUININE-A for 20
    page.setItem(0, 'INV0', 'QUININE-A', 20);

    // submit
    page.submit();
  });

  it('Should make a negative adjustment ', () => {
    // select the negative adjustment
    page.setAdjustment(1);

    page.setDate(new Date());

    page.setDescription(DESCRIPTION.concat(' - Negative'));

    page.addRows(1);

    // increase the QUININE-A for 20
    page.setItem(0, 'INV0', 'QUININE-A', 20);

    // submit
    page.submit();
  });
}

describe('Stock Adjustment Test', StockAdjustmentTests);
