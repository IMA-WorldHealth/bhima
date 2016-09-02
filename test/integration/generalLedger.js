
/* global expect, chai, agent */
/* jshint expr : true */

const helpers = require('./helpers');

/*
 * The /journal API endpoint
 */
describe('(/general_ledger) API endpoint', function () {

  /**
   * object containing different format of transaction to send to the
   *server in order to get transactions or records
   **/
  var parameters = {
    transactionToPost : {params : {transactions : ['TRANS2']}},
    allRecords : {number : 2},
  };

  const NUM_ROW_ALL_RECORDS = 2;

  it('GET /general_ledger : it returns a set of records after receiving data from posting journal ', function () {

    return agent.post('/trial_balance/post_transactions')
      .send(parameters.transactionToPost.params)
      .then(function () {
        return agent.get('/general_ledger');
      })
      .then(function (res) {
        helpers.api.listed(res, NUM_ROW_ALL_RECORDS);
      })
      .catch(helpers.handler);
  });
});

