/* global browser, element, by */

const chai = require('chai');
const expect = chai.expect;

const components = require('../shared/components');
const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
const GU = require('../shared/GridUtils');

helpers.configure(chai);

describe('Aged Debtors Report', () => {
  'use strict';

  function getInvoiceNumber(gridId) {
    return GU.getRows(gridId).count();
  }
  const numReports = 1;

  before(() => helpers.navigate('#/reports/agedDebtors'));

  // TODO client side report removed, required update for server PDF success
  it('GET /reports/agedDebtors Create a new Report of Aged Debtors', () => {

    let date = new Date('12-31-2016');
    element(by.id('create-report')).click();

    FU.input('ReportConfigCtrl.label', 'Report Debts of December 31, 2016');
    components.dateEditor.set(date, null, 'label');

    // focus on the button zone
    FU.buttons.submit();
    expect(getInvoiceNumber('report-grid')).to.eventually.equal(numReports);
  });
});
