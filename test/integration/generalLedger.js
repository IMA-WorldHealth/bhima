/* global agent */
const helpers = require('./helpers');

describe('(/journal/transactions) API endpoint', () => {
  const RECORDS_TO_POST = [
    '2e1332b7-3e63-411e-827d-42ad585ff517',
    'f24619e0-3a88-4784-a750-a414fc9567bf',
  ];

  const NUM_ROW_ALL_RECORDS = 4;

  it('POST /journal/transactions will post data to the General Ledger', () => {
    return agent.post('/journal/transactions')
      .send({ transactions : RECORDS_TO_POST })
      .then(() => agent.get('/general_ledger'))
      .then(res => {
        helpers.api.listed(res, NUM_ROW_ALL_RECORDS);
      })
      .catch(helpers.handler);
  });
});
