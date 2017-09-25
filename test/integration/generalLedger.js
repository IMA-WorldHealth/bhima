/* global agent */
const helpers = require('./helpers');

describe('(/journal/transactions) API endpoint', function () {
  const RECORDS_TO_POST = [
    'c44619e0-3a88-4754-a750-a414fc9567bf',
    '8fefadec-c036-48ce-bc4e-e307d1301960',
  ];

  const NUM_ROW_ALL_RECORDS = 6;

  it('POST /journal/transactions will post data to the General Ledger', function () {
    return agent.post('/journal/transactions')
      .send({ transactions : RECORDS_TO_POST })
      .then(() => agent.get('/general_ledger'))
      .then(function (res) {
        helpers.api.listed(res, NUM_ROW_ALL_RECORDS);
      })
      .catch(helpers.handler);
  });
});
