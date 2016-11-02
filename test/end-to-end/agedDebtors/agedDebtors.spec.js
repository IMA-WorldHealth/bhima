/* global browser, element, by */

const chai = require('chai');
const expect = chai.expect;

const components = require('../shared/components');
const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
helpers.configure(chai);

describe('Cashflow report generator', () => {
  'use strict';

  before(() => helpers.navigate('#/finance/reports/agedDebtors'));

  // TODO client side report removed, required update for server PDF success
  it('GET /finance/cashflow return cashflow report at the client', () => {

    // set report configurations
    // Until Date for the reports of Aged Debtors
    components.dateEditor.set('31/12/2016');

    // focus on the button zone
    let area = element(by.css('[data-submit-area]'));
    area.element(by.css('[data-method="submit"]')).click();

    // aged Debtors report
    let locator = by.css('[data-show-details]');
    FU.exists(locator, true);
    element(locator).click();
  });
});
