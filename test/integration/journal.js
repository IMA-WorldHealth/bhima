/* eslint no-unused-expressions:off */
/* global expect, agent */
const helpers = require('./helpers');

/*
 * The /journal API endpoint
 */
describe('(/journal) API endpoint', () => {
  const RECORD_UUID = 'a5a5f950-a4c9-47f0-9a9a-2bfc3123e534';
  const MISSING_RECORD_UUID = 'a5a5f950-a4c9-47f0-9a9a-2bfc3123e635';

  const NUM_ROW_ALL_RECORDS = 19;
  const NUM_ROWS_FETCHING_TRANSACTION = 2;

  it('GET /journal returns a set of records', () =>
    agent.get('/journal')
      .then((res) => {
        helpers.api.listed(res, NUM_ROW_ALL_RECORDS);
      })
      .catch(helpers.handler));

  it('GET /journal/:record_uuid returns an object with the transaction and aggregate information', () =>
    agent.get(`/journal/${RECORD_UUID}`)
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.have.length(NUM_ROWS_FETCHING_TRANSACTION);
      })
      .catch(helpers.handler));

  it('GET /journal/:record_uuid : it returns an error message and 404 code if the transaction does not exist ', () =>
    agent.get(`/journal/${MISSING_RECORD_UUID}`)
      .then((res) => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler));

  describe('Search', SearchTests);
});

function SearchTests() {
  const description = 'Sample voucher data one';
  const accountId = 187;
  const amount = 100;
  const DISTINCT_TRANSACTIONS = 9;

  it(`GET /journal?description=${description} should match two records`, () => {
    const NUM_MATCHES = 2;
    return agent.get('/journal')
      .query({ description })
      .then((res) => {
        helpers.api.listed(res, NUM_MATCHES);
      })
      .catch(helpers.handler);
  });

  it('GET /journal filters should be additive', () => {
    const NUM_MATCHES = 1;
    return agent.get('/journal')
      .query({ description, account_id : accountId })
      .then((res) => {
        helpers.api.listed(res, NUM_MATCHES);
      })
      .catch(helpers.handler);
  });

  it(`GET /journal?account_id=${accountId} should find items by account`, () => {
    const NUM_MATCHES = 1;
    return agent.get('/journal')
      .query({ account_id : accountId })
      .then((res) => {
        helpers.api.listed(res, NUM_MATCHES);
      })
      .catch(helpers.handler);
  });

  it(`GET /journal?account_id=${accountId}&showFullTransaction=1 should find complete transactions`, () => {
    const NUM_MATCHES = 2;
    const NUM_TXNS = 1;
    return agent.get('/journal')
      .query({ account_id : accountId, showFullTransactions : 1 })
      .then((res) => {
        helpers.api.listed(res, NUM_MATCHES);

        // make sure that even though we return more rows, the transactions are unique.
        const uniqueTransactions = res.body
          .map(row => row.record_uuid)
          .filter((record, idx, arr) => arr.indexOf(record) === idx);

        expect(uniqueTransactions).to.have.length(NUM_TXNS);
      })
      .catch(helpers.handler);
  });

  it(`GET /journal?amount=${amount} should return lines with debit or credit equivalent amounts`, () => {
    const NUM_MATCHES = 2;
    return agent.get('/journal')
      .query({ amount })
      .then((res) => {
        helpers.api.listed(res, NUM_MATCHES);
      })
      .catch(helpers.handler);
  });

  it('GET /journal/count returns return the numbers of transactions from Journal', () => {
    return agent.get('/journal/count')
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body[0].number_transactions).to.equal(DISTINCT_TRANSACTIONS);
      })
      .catch(helpers.handler);
  });
}
