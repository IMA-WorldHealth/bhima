/* global browser, element, by */

const chai = require('chai');
const expect = chai.expect;

const components = require('../shared/components');
const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
helpers.configure(chai);

describe('Income Expense report generator', () => {
  'use strict';

  before(() => helpers.navigate('#/reports/incomeExpense'));

  it('GET /reports/incomeExpense return incomeExpense report at the client', () => {
    element(by.id('create-report')).click();
    // set report configurations
    FU.input('ReportConfigCtrl.label', 'Report income Expense for 2016');

    // date interval component admit date in this format : dd/MM/yyyy    
    components.dateInterval.range('01/01/2016', '31/12/2016');
    FU.select('ReportConfigCtrl.cashbox', 'Main Cashbox');
    FU.select('ReportConfigCtrl.reportType', 'Recettes et dépenses');

    // focus on the button zone
    FU.buttons.submit();

    // FIX ME HOW TO CHECK THAT THE REPORT IS IN THE GRID
    
  });
});
