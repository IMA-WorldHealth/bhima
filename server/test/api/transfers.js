/* global describe, it, beforeEach */
var chai = require('chai');
var expect = chai.expect;

/** import test helpers */
var helpers = require('./helpers');
var uuid    = require('../../lib/guid');
helpers.configure(chai);


/**
* The /transfers API endpoint
*
* This test suite implements all GET and POST requests on the /projects HTTP API endpoint.
* NOTE: to run correctly this test please run the `server/models/test/update.sql`
* and we must have the exchange rate of current date defined
*/
describe('The /transfers API endpoint :: ', function () {
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
      account_id  : 3627,
      cost        : 777,
      description : 'Test Caisse Transfert/' + date.toString(),
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
    account_id  : 3627,
    cost        : 555
  };

  /** Expected keys */
  var expectedKeys = Object.keys(primaryCash);
  expectedKeys.push('document_uuid');

  it('POST /transfers should create a new transfert records in primary_cash, primary_cash_item and journal', function () {
    return agent.post('/transfers')
      .send(primaryCash)
      .then(function (res) {
        expect(res).to.have.status(201);
        expect(res.body.id).to.exist;
        expect(res.body.id).to.be.equal(primaryCash.uuid);
      })
      .catch(helpers.handler);
  });

  it('GET /transfers should return a list of all transfers', function () {
    return agent.get('/transfers')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(res.body[0]).to.have.all.keys(expectedKeys);

        /**
        * @fixme: The `date` column in primary cash must be in `datetime` format
        * for getting the correct last date in time precision instead of getting a rondom date
        * without time distinction
        *
        * The first record in the returned data must be the last inserted record
        * due to `ORDER BY {date} DESC` clause in MySQL
        */
        expect(res.body[0].uuid).to.exist;
        expect(res.body[0].uuid).to.be.equals(primaryCash.uuid);
      })
      .catch(helpers.handler);
  });

  it('GET /transfers/?limit=1 should return a limited set of results', function () {
    return agent.get('/transfers/?limit=1')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(res.body).to.have.length(1);
        expect(res.body[0]).to.have.all.keys(expectedKeys);
      })
      .catch(helpers.handler);
  });

  it('GET /transfers/{uuid} should return specific transfert record according a {uuid} given', function () {
    return agent.get('/transfers/' + primaryCash.uuid)
      .then(function (res) {
        var result = res.body;
        delete result.document_uuid;

        expect(res).to.have.status(200);
        expect(result).to.not.be.empty;

        /**
        * @fixme: we must be able to compare date and time for a need of accuracy
        * we don't use `.to.equal` because we have some difference in seconds value
        * when we convert date from database into date object, this conversion is required
        * because we must have the same format of date
        */
        for (var i in result) {
          if (i === 'date') {
            expect(new Date(result[i])).to.equalDate(new Date(primaryCash[i]));
          } else {
            expect(result[i]).to.equal(primaryCash[i]);
          }
        }
      })
      .catch(helpers.handler);
  });

  it('POST /transfers should not post data with missing essentials values', function () {
    return agent.post('/transfers')
      .send(wrongPrimaryCash)
      .then(function (res) {
        expect(res).to.have.status(400);
        return agent.get('/transfers/' + wrongPrimaryCash.uuid)
      })
      .then(function (res) {
        expect(res).to.have.status(404);
        expect(res.body.code).to.exist;
        expect(res.body.code).to.be.equal('ERR_NOT_FOUND');
      })
      .catch(helpers.handler);
  });

  it('GET /transfers/{uuid} should not get anything with a fake {uuid}', function () {
    return agent.get('/transfers/badidentifier')
      .then(function (res) {
        expect(res).to.have.status(404);
        expect(res.body.code).to.exist;
        expect(res.body.code).to.be.equal('ERR_NOT_FOUND');
      })
      .catch(helpers.handler);
  });

});
