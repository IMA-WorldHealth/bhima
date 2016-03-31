/* jshint expr: true */

var chai = require('chai');
var expect = chai.expect;

var helpers = require('./helpers');
helpers.configure(chai);

/**
* The /exchange API endpoint
*/
describe('The /exchange API endpoint', function () {
  'use strict';

  var agent = chai.request.agent(helpers.baseUrl);

  // constants
  var RATE = {
    enterprise_id   :1,    // Enterprise ID
    currency_id     :1,    // FC in test database
    rate            :930,
    date            :new Date('2015-10-10')
  };

  var RATE_KEY = ['id', 'enterprise_id', 'currency_id', 'enterprise_currency_id', 'rate', 'date'];

  // login before each request
  before(helpers.login(agent));

  it('GET /exchange returns a list of exchange rates', function () {
    return agent.get('/exchange')
      .then(function (res) {
        expect(res).to.have.status(200);
      })
      .catch(helpers.handler);
  });


  it('POST /exchange creates a new exchange rate', function () {
    return agent.post('/exchange')
      .send({ rate : RATE })
      .then(function (res) {

        // make sure the API conforms to app standards
        helpers.api.created(res);

        RATE.id = res.body.id;
        return agent.get('/exchange');
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body[0]).to.not.be.empty;
        expect(res.body[0]).to.contain.keys('currency_id', 'date', 'rate');
      })
      .catch(helpers.handler);
  });

  it('PUT /exchange should update an existing exchange rate', function () {
    return agent.put('/exchange/' + RATE.id)
      .send({ rate : 925 })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.keys(RATE_KEY);
        expect(res.body.rate).to.not.equal(RATE.rate);
      })
      .catch(helpers.handler);
  });

  it('PUT /exchange should update an Unknow exchange rate', function () {
    return agent.put('/exchange/inknowexchangerate')
      .send({ rate : 1000000 })
      .then(function (res) {

        // make sure the API conforms to app standards
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });


  it('DELETE /exchange/:id will send back a 404 if the exchage rate does not exist', function () {
    return agent.delete('/exchange/inknowexchangerate')
      .then(function (res) {

        // make sure the API conforms to app standards
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('DELETE /exchange/:id should delete an exchange rate ', function () {
    return agent.delete('/exchange/' + RATE.id)
      .then(function (res) {
        helpers.api.deleted(res);
      })
      .catch(helpers.handler);
  });
});
