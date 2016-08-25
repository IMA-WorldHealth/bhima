
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
    fetchingTransaction : {transaction : 'TRANS3', number : 2},
    unExistTransaction : {transaction : 'TRANS0', code : 404}
  };

  it('GET /journal : it returns a set of records ', function () {
    return agent.get('/journal')
      .then(function (res) {
        helpers.api.listed(res, parameters.allRecords.number);
      })
      .catch(helpers.handler);
  });

  it('GET /journal/:trans_id : it returns a transaction which is an array of record', function () {
    return agent.get('/journal/' + parameters.fetchingTransaction.transaction)
      .then(function (res) {
        helpers.api.listed(res, parameters.fetchingTransaction.number);
      })
      .catch(helpers.handler);
  });

  it('GET /journal/:trans_id : it returns an error message and 404 code if the transaction does not exist ', function () {
    return agent.get('/journal/' + parameters.unExistTransaction.transaction)
      .then(function (res) {
        helpers.api.errored(res, parameters.unExistTransaction.code);
      })
      .catch(helpers.handler);
  });
});
