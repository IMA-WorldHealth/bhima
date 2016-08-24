/* global expect, chai, agent */
/* jshint expr : true */

const helpers = require('./helpers');
const uuid = require('node-uuid');

/*
 * The /trial_balance API endpoint
 */
describe.only('(/trial) API endpoint', function () {

  /**
   * object containing different format of transaction to send to the
  *server in order to get transactions grouped by account
  **/
  var transactionParameter = {
    goodTransaction : { params : { transactions : ['TRANS1', 'TRANS2'] }, number : 2},
    unknownTransactions : { params : { transactions : ['TS1', 'TS2'] }, number : 0},
    badParam : { params : { transactions : 'bad request' }, code : 400},
    emptyparam : { params : { transactions : null }, code : 400},
    warningTransaction : {params : {transactions : ['TRANS1']}},
    errorTransaction : {params : {transactions : ['TRANS5']}},
    postingTransaction : {params : {transactions : ['TRANS1']}}
  };

  // const responseKeys = ['uuid', 'code', 'text', 'basic_salary'];

  it('GET /trial_balance/data_per_account : it returns data grouped by account ', function () {
    return agent.get('/trial_balance/data_per_account')
      .query(transactionParameter.goodTransaction.params)
      .then(function (res) {
        helpers.api.listed(res, transactionParameter.goodTransaction.number);
      })
      .catch(helpers.handler);
  });

  it('GET /trial_balance/data_per_account : it returns an empty array when there is no transaction matching ', function () {
    return agent.get('/trial_balance/data_per_account')
      .query(transactionParameter.unknownTransactions.params)
      .then(function (res) {
        helpers.api.listed(res, transactionParameter.unknownTransactions.number);
      })
      .catch(helpers.handler);
  });

  it('GET /trial_balance/data_per_account : it returns an error message and 400 code if the request is bad formatted ', function () {
    return agent.get('/trial_balance/data_per_account')
      .query(transactionParameter.badParam.params)
      .then(function (res) {
        helpers.api.errored(res, transactionParameter.badParam.code);
      })
      .catch(helpers.handler);
  });

  it('GET /trial_balance/data_per_account : it returns an error message and 400 code if the request parameter is null or undefined ', function () {
    return agent.get('/trial_balance/data_per_account')
      .query(transactionParameter.emptyparam.params)
      .then(function (res) {
        helpers.api.errored(res, transactionParameter.emptyparam.code);
      })
      .catch(helpers.handler);
  });

  it('POST /trial_balance/checks : it returns an array of object containing one warning object', function () {
    return agent.post('/trial_balance/checks')
      .send(transactionParameter.warningTransaction.params)
      .then(function (res) {        
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        var warningObjects = res.body.filter(function (item) { return item;});
        expect(warningObjects).to.have.length(1);
        expect(warningObjects[0].fatal).to.equal(false);
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
        var errorObjects = res.body.filter(function (item) { return item && item.fatal === true; });
        expect(errorObjects).to.have.length.at.least(1);
        expect(errorObjects[0].fatal).to.equal(true);
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
