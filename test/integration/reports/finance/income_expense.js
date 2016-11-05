/* global expect, chai, agent */
/* jshint expr: true */

const RenderingTests = require('../rendering');
const target = '/reports/finance/income_expense';
const helpers = require('../../helpers');

describe(`(${target}) Income Expense Reports`, function () {

  const keys = [
    'incomes', 'expenses', 'reportIncome', 'reportExpense', 'dateFrom',
    'dateTo', 'accountName', 'accountNumber', 'sumIncome', 'sumExpense'
  ];

  const parameters = {
    account_id: 3627,
    dateFrom: '2016-01-01',
    dateTo: '2016-12-31',
    reportType : 1
  };

  describe(`${target} Rendering`, RenderingTests(target, null, parameters));

  it(`GET ${target} returns the correct JSON keys`, function () {
    parameters.renderer = 'json';
    return agent.get(target)
      .query(parameters)
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.incomeExpense).to.contain.all.keys(keys);
      })
      .catch(helpers.handler);
  });
});
