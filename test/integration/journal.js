
/* global expect, chai, agent */
/* jshint expr : true */

const helpers = require('./helpers');

/*
 * The /journal API endpoint
 */
describe('(/journal) API endpoint', function () {

  /**
   * object containing different format of transaction to send to the
   *server in order to get data
   **/
  var parameters = {
    allRecords : {number : 8},
    fetchingTransaction : {reference : 'a5a5f950-a4c9-47f0-9a9a-2bfc3123e534'},
    unExistTransaction : {reference : 'a5a5f950-a4c9-47f0-9a9a-2bfc3123e635'}
  };

  const NUM_ROW_ALL_RECORDS = 8;
  const NUM_ROWS_FETCHING_TRANSACTION = 2;

  it('GET /journal : it returns a set of records ', function () {
    return agent.get('/journal')
      .then(function (res) {
        helpers.api.listed(res, NUM_ROW_ALL_RECORDS);
      })
      .catch(helpers.handler);
  });

  it('GET /journal/:record_uuid : it returns a transaction which is an array of record', function () {
    return agent.get('/journal/' + parameters.fetchingTransaction.reference)
      .then(function (res) {
        helpers.api.listed(res, NUM_ROWS_FETCHING_TRANSACTION);
      })
      .catch(helpers.handler);
  });

  it('GET /journal/:record_id : it returns an error message and 404 code if the transaction does not exist ', function () {
    return agent.get('/journal/' + parameters.unExistTransaction.reference)
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });
});
