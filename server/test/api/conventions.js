/* global describe, it, beforeEach */
var chai = require('chai');
var expect = chai.expect;

/** import test helpers */
var helpers = require('./helpers');
var uuid    = require('../../lib/guid');
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

  /** Test with the current date */
  var date = new Date();

  /** Primary Cash Object */
  var primaryCash = {
      uuid        : uuid(),
      project_id  : 1,
      type        : 'E',
      date        : date,
      currency_id : 2,
      account_id  : 3631,
      cost        : 10,
      description : 'Test Convention Payment/' + date.toString(),
      cash_box_id : 2,
      origin_id   : 1,
      user_id     : 1
  };

  var wrongPrimaryCash = {
    uuid        : uuid(),
    project_id  : 1,
    type        : 'X',
    date        : date,
    currency_id : 2,
    account_id  : 3631,
    cost        : 10
  };

  it('POST /cash/conventions should create a new convention payment records in primary_cash, primary_cash_item and journal', function () {
    return agent.post('/cash/conventions')
      .send(primaryCash)
      .then(function (res) {
        expect(res).to.have.status(201);
        expect(res.body.id).to.exist;
        expect(res.body.id).to.be.equal(primaryCash.uuid);
      })
      .catch(helpers.handler);
  });

  it('POST /cash/conventions should not post data with missing essentials values', function () {
    return agent.post('/cash/conventions')
      .send(wrongPrimaryCash)
      .then(function (res) {
        expect(res).to.have.status(400);
      })
      .catch(helpers.handler);
  });

});
