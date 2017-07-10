/* global expect, chai, agent */

const RenderingTests = require('../rendering');
const target = '/reports/finance/cash_report';
const helpers = require('../../helpers');

describe(`(${target}) cash Reports`, function () {

  const keys = [
     'cashCurrency', 'cashName', 'entries', 
     'expenses', 'finalTotal', 'isEmpty', 'metadata', 'totalEntry', 
     'totalExpense', 'type_id',
     ];

  const parameters = {
    dateFrom : '2016-01-01',
    dateTo : '2016-12-31',
    type : 1,
    account_id : 3627
  };

  describe(`${target} Rendering`, RenderingTests(target, null, parameters));

  it(`GET ${target} returns the correct JSON keys`, function () {
    parameters.renderer = 'json';
    return agent.get(target)
      .query(parameters)
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.contain.all.keys(keys);
      })
      .catch(helpers.handler);
  });
});
