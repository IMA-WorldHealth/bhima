/* jshint expr: true */
/* global describe, it, beforeEach */

var chai = require('chai');
var expect = chai.expect;

/** import test helpers */
var helpers = require('./helpers');
var uuid    = require('node-uuid');
helpers.configure(chai);


/**
* The /cash/conventions API endpoint
*
* @desc This test suit is about the conventions payment in the primary cash
*
*/
describe('The /cash/conventions API endpoint :: ', function () {
  'use strict';

  var agent = chai.request.agent(helpers.baseUrl);

  /** login before each request */
  beforeEach(helpers.login(agent));

  /** Test with dates */
  var date = new Date();

  /** random future date (9 days after in our case) which doesn't have an exchange rate defined */
  var futurDate = new Date(date.getYear() + 1900, date.getMonth(), date.getDay() + 10);

  /** Primary Cash Object */
  var primaryCash = {
      uuid        : uuid.v4(),
      project_id  : 1,
      type        : 'E',
      date        : date,
      currency_id : 2,
      account_id  : 3631,
      cost        : 5,
      description : 'Test Convention Payment/' + date.toString(),
      cash_box_id : 2,
      origin_id   : 3,
      user_id     : 1
  };

  var wrongPrimaryCash = {
    uuid        : uuid.v4(),
    project_id  : 1,
    type        : 'X',
    date        : date,
    currency_id : 2,
    account_id  : 3631,
    cost        : 5
  };

  var mock = {};

  it.skip('POST /cash/conventions should create a new convention payment records in primary_cash, primary_cash_item and journal', function () {
    return agent.post('/cash/conventions')
      .send(primaryCash)
      .then(function (res) {
        expect(res).to.have.status(201);
        expect(res.body.id).to.exist;
        expect(res.body.id).to.be.equal(primaryCash.uuid);
      })
      .catch(helpers.handler);
  });

  it.skip('POST /cash/conventions should not post data with missing essentials values', function () {
    return agent.post('/cash/conventions')
      .send(wrongPrimaryCash)
      .then(function (res) {
        expect(res).to.have.status(400);
        expect(res.body.code).to.exist;
        expect(res.body.code).to.be.equal('DB.ER_BAD_NULL_ERROR');
      })
      .catch(helpers.handler);
  });

  it.skip('POST /cash/conventions should not post without uuid', function () {
    mock = wrongPrimaryCash;
    delete mock.uuid;
    return agent.post('/cash/conventions')
      .send(mock)
      .then(function (res) {
        expect(res).to.have.status(400);
        expect(res.body.code).to.exist;
        expect(res.body.code).to.be.equal('DB.ER_BAD_NULL_ERROR');
      })
      .catch(helpers.handler);
  });

  it.skip('POST /cash/conventions should not post when there is not a date defined', function () {
    mock = primaryCash;
    mock.uuid = uuid.v4();
    delete mock.date;
    return agent.post('/cash/conventions')
      .send(mock)
      .then(function (res) {
        expect(res).to.have.status(400);
        expect(res.body.code).to.exist;
        expect(res.body.code).to.be.equal('ERR_DATE_NOT_DEFINED');
      })
      .catch(helpers.handler);
  });

  it.skip('POST /cash/conventions should not post when there is not an exchange rate defined for a date', function () {
    /** The future date does'nt have a defined exchange rate */
    mock = primaryCash;
    mock.uuid = uuid.v4();
    mock.date = futurDate;
    return agent.post('/cash/conventions')
      .send(mock)
      .then(function (res) {
        expect(res).to.have.status(500);
        expect(res.body.code).to.exist;
        expect(res.body.code).to.be.equal('ERR_EXCHANGE_RATE_NOT_FOUND');
      })
      .catch(helpers.handler);
  });

});
