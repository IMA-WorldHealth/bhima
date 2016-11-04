/* global browser, element, by */

const chai = require('chai');
const expect = chai.expect;

const components = require('../shared/components');
const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
helpers.configure(chai);

describe.skip('Income Expense report generator', () => {
  'use strict';

  before(() => helpers.navigate('#/finance/reports/incomeExpense'));

  it('GET /finance/incomeExpense return incomeExpense report at the client', () => {

    // set report configurations
    // date interval component admit date in this format : dd/MM/yyyy
    components.dateInterval.range('01/01/2016', '31/12/2016');
    FU.select('IncomeExpenseConfigCtrl.cashbox', 'Test Primary Cashbox A $');
    FU.select('IncomeExpenseConfigCtrl.report', 'Recettes et dépenses');

    // focus on the button zone
    let area = element(by.css('[data-submit-area]'));
    area.element(by.css('[data-method="submit"]')).click();

    // Income Expense report
    FU.exists(by.id('income'), true);
    FU.exists(by.id('expense'), false);
  });
});
