/* global expect, chai, agent */

const helpers = require('./helpers');

/*
 * The /journal API endpoint
 */
describe('(/general_ledger) API endpoint', () => {
  const TXNS_TO_POST = ['TRANS2'];
  const NUM_ROW_ALL_RECORDS = 2;

  it('GET /general_ledger : it returns a set of records after receiving data from posting journal ', () => {
    return agent.post('/trial_balance/post_transactions')
      .send({ transactions: TXNS_TO_POST })
      .then(() => agent.get('/general_ledger'))
      .then((res) => {
        helpers.api.listed(res, NUM_ROW_ALL_RECORDS);
      })
      .catch(helpers.handler);
  });
});

