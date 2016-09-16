/* global expect, chai, agent */
/* jshint expr : true */

const helpers = require('../../helpers');

const RenderingTests = require('../rendering');
const target = '/reports/finance/debtors/aged';

describe(`(${target} Aged Debtor Report`, function () {

  // debtor groups that do not have debtors registered to them will not show up
  const numDebtorGroups = 1;
  const keys = ['metadata', 'debtors'];

  // run the rendering test suite
  const suite = RenderingTests(target, keys);
  suite();

  it('GET /reports/finance/debtors/aged?zeroes=1 should return a JSON report', function () {
    return agent.get('/reports/finance/debtors/aged')
      .query({ zeroes : 1, renderer : 'json' })
      .then(res => {
        const keys = ['metadata', 'debtors', 'aggregates'];
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.contain.all.keys(keys);
        expect(res.body.debtors).to.have.length(numDebtorGroups);
      })
      .catch(helpers.handler);
  });
});
