/* global expect, chai, agent */

const helpers = require('./helpers');
const uuid = require('node-uuid');

/*
 * The /trial_balance API endpoint
 */
describe('(/trial) API endpoint', function () {

  /**
   * object containing different format of transaction to send to the
  *server in order to get transactions grouped by account
  **/
  var transactionParameter = {
    goodTransaction : { params : { transactions : ['TRANS1', 'TRANS2'] }},
    unknownTransactions : { params : { transactions : ['TS1', 'TS2'] }},
    emptyParam : { params : { transactions : null }},
    errorTransaction : {params : {transactions : ['TRANS5']}},
    postingTransaction : {params : {transactions : ['TRANS1']}}
  };

  const NUM_ROWS_GOOD_TRANSACTION = 2;
  const NUM_ROWS_UNKNOWN_TRANSACTIONS = 0;

  it('GET /trial_balance/data_per_account : it returns data grouped by account ', function () {
    return agent.post('/trial_balance/data_per_account')
      .send(transactionParameter.goodTransaction.params)
      .then(function (res) {
        helpers.api.listed(res, NUM_ROWS_GOOD_TRANSACTION);
      })
      .catch(helpers.handler);
  });

  it('GET /trial_balance/data_per_account : it returns an empty array when there is no transaction matching ', function () {
    return agent.post('/trial_balance/data_per_account')
      .send(transactionParameter.unknownTransactions.params)
      .then(function (res) {
        helpers.api.listed(res, NUM_ROWS_UNKNOWN_TRANSACTIONS);
      })
      .catch(helpers.handler);
  });

  it('GET /trial_balance/data_per_account : it returns an error message and 400 code if the request parameter is null or undefined ', function () {
    return agent.post('/trial_balance/data_per_account')
      .send(transactionParameter.emptyParam.params)
      .then(function (res) {
        helpers.api.errored(res, 400);
      })
      .catch(helpers.handler);
  });

  it('POST /trial_balance/checks : it returns an array of object containing one or more error object', function () {
    return agent.post('/trial_balance/checks')
      .send(transactionParameter.errorTransaction.params)
      .then(function (res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body).to.have.length.at.least(1);
        expect(res.body[0].fatal).to.equal(true);
      })
      .catch(helpers.handler);
  });

  it('POST /trial_balance/post_transactions : it posts the a transaction to general_ledger and remove it form the posting_general', function () {
    return agent.post('/trial_balance/post_transactions')
      .send(transactionParameter.postingTransaction.params)
      .then(function (res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        return agent.get('/journal/' + transactionParameter.postingTransaction.params.transactions[0]);
      })
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });
});
