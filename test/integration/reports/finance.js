/* global expect, chai, agent */
/* jshint expr : true */

const helpers = require('../helpers');

/** @fixme ne to be fixed */
describe.skip('(/reports/finance/) Finance Reports', function () {

  const numDebtorGroups = 3;

  // NOTE: as soon as trial balance is implemented, this many be non-empty.
  // It pulls only from the General Ledger, so that is why
  it('GET /reports/finance/aged_debtor should return an empty JSON report', function () {
    return agent.get('/reports/aged_debtor')
      .then(res => {
        const keys = ['metadata', 'debtors'];
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.contain.all.keys(keys);
        expect(res.body.debtors).to.equal(0);
      })
      .catch(helpers.handler);
  });

  it('GET /reports/finance/aged_debtor?zeroes=1 should return a JSON report', function () {
    return agent.get('/reports/aged_debtor&zeroes=1')
      .then(res => {
        const keys = ['metadata', 'debtors', 'aggregates'];
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.contain.all.keys(keys);
        expect(res.body.debtors).to.equal(numDebtorGroups);
      })
      .catch(helpers.handler);
  });

  it('GET /reports/finance/aged_debtor should return PDF data for `pdf` rendering target', function () {
    return agent.get('/reports/aged_debtor&zeroes=1&renderer=pdf')
      .then(function (result) {
        expect(result.headers['content-type']).to.equal('application/pdf');
        expect(result.type).to.equal('application/pdf');
      })
      .catch(helpers.handler);
  });
});
