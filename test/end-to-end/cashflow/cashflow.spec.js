/* global browser, element, by */
const chai = require('chai');
const expect = chai.expect;

const components = require('../shared/components');
const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
helpers.configure(chai);

describe('Cashflow report generator :: ', () => {
  'use strict';

  before(() => helpers.navigate('#/finance/cashflow'));

  it('GET /finance/cashflow return cashflow report at the client', () => {

    // set report configurations
    // date interval component admit date in this format : dd/MM/yyyy
    components.dateInterval.range('01/01/2016', '31/12/2016');
    FU.select('ReportCtrl.cashbox', 'Cashbox $');
    FU.buttons.submit();

    // cashflow report
    let locator = by.css('[data-show-details]');
    FU.exists(locator, true);
    element(locator).click();

  });

});
