/* global expect, chai, agent */
/* jshint expr : true */

const helpers = require('../../helpers');

describe('(/reports/finance/debtors/aged) Aged Debtor Report', function () {

  // debtor groups that do not have debtors registered to them will not show up
  const numDebtorGroups = 1;

  // NOTE: as soon as trial balance is implemented, this many be non-empty.
  // It pulls only from the General Ledger, so that is why
  it('GET /reports/finance/debtors/aged should return an empty JSON report', function () {
    return agent.get('/reports/finance/debtors/aged')
      .query({ renderer : 'json' })
      .then(res => {
        const keys = ['metadata', 'debtors'];
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.contain.all.keys(keys);
        expect(res.body.debtors).to.have.length(0);
      })
      .catch(helpers.handler);
  });

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

  it('GET /reports/finance/debtors/aged should return PDF data for `pdf` rendering target', function () {
    return agent.get('/reports/finance/debtors/aged')
      .query({ renderer: 'pdf', zeroes : 1 })
      .then(function (result) {
        expect(result.headers['content-type']).to.equal('application/pdf');
        expect(result.type).to.equal('application/pdf');
      })
      .catch(helpers.handler);
  });
});
