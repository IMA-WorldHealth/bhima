/* global expect, chai, agent */

const RenderingTests = require('../rendering');
const target = '/reports/finance/cash_report';
const helpers = require('../../helpers');

describe(`(${target}) Income Expense Reports`, function () {

  const keys = [
    'incomes', 'expenses', 'dateFrom', 'dateTo', 'isEmpty', 'isLost', 'overallBalance', 'type_id',
  ];

  const parameters = {
    fiscal : 2,
    periodFrom : 16,
    periodTo : 27,
    type : 1
  };

  describe(`${target} Rendering`, RenderingTests(target, null, parameters));

  it(`GET ${target} returns the correct JSON keys`, function () {
    parameters.renderer = 'json';
    return agent.get(target)
      .query(parameters)
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.entryExit).to.contain.all.keys(keys);
      })
      .catch(helpers.handler);
  });
});
