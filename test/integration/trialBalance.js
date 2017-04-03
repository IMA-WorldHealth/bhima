/* global expect, chai, agent */

const helpers = require('./helpers');
const uuid = require('node-uuid');

/*
 * The /trial_balance API endpoint
 */
describe('(/trial) API endpoint', () => {

  const GOOD_TXNS = ['TRANS1', 'TRANS2'];
  const UNKNOWN_TXNS = ['TS1', 'TS2'];
  const EMPTY_TXNS = [];
  const ERROR_TXNS = ['TRANS5'];
  const POSTING_TXNS = ['TRANS1'];

  const formatParams = array => ({ transactions: array });

  const NUM_ROWS_GOOD_TRANSACTION = 2;
  const NUM_ROWS_UNKNOWN_TRANSACTIONS = 0;

  it('GET /trial_balance/data_per_account returns data grouped by account ', () => {
    return agent.post('/trial_balance/data_per_account')
      .send(formatParams(GOOD_TXNS))
      .then((res) => {
        helpers.api.listed(res, NUM_ROWS_GOOD_TRANSACTION);
      })
      .catch(helpers.handler);
  });

  it('GET /trial_balance/data_per_account returns an empty array when there is no transaction matching ', () => {
    return agent.post('/trial_balance/data_per_account')
      .send(formatParams(UNKNOWN_TXNS))
      .then((res) => {
        helpers.api.listed(res, NUM_ROWS_UNKNOWN_TRANSACTIONS);
      })
      .catch(helpers.handler);
  });

  it('GET /trial_balance/data_per_account returns an error message and 400 code if the request parameter is null or undefined ', () => {
    return agent.post('/trial_balance/data_per_account')
      .send(formatParams(EMPTY_TXNS))
      .then((res) => {
        helpers.api.errored(res, 400);
      })
      .catch(helpers.handler);
  });

  it('POST /trial_balance/checks returns an array of object containing one or more error object', () => {
    return agent.post('/trial_balance/checks')
      .send(formatParams(ERROR_TXNS))
      .then((res) => {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body).to.have.length.at.least(1);
      })
      .catch(helpers.handler);
  });

  it.skip('POST /trial_balance/post_transactions posts the a transaction to general_ledger and remove it form the posting_general', () => {
    return agent.post('/trial_balance/post_transactions')
      .send(formatParams(POSTING_TXNS))
      .then((res) => {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        return agent.get(`/journal/${POSTING_TXNS[0]}`);
      })
      .then((res) => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });
});
