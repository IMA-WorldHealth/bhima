/* global browser, element, by */

const chai = require('chai');
const expect = chai.expect;

const components = require('../shared/components');
const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
helpers.configure(chai);

describe.only('Aged Debtors report generator', () => {
  'use strict';

  before(() => helpers.navigate('#/reports/agedDebtors'));

  // TODO client side report removed, required update for server PDF success
  it('GET /reports/agedDebtors Create a new Report of Aged Debtors', () => {

    var untilDate = new Date('12-31-2016');
    element(by.id('create-report')).click();

    FU.input('ReportConfigCtrl.label', 'Report Debts of Debtors');
    components.dateEditor.set(untilDate,'', 'label');

    // focus on the button zone
    FU.buttons.submit();

    // FIX ME HOW TO CHECK THAT THE REPORT IS IN THE GRID
  });
});
