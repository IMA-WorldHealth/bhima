/*global describe, it, beforeEach, process*/

var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;
chai.use(chaiHttp);

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
    enterprise_currency_id: 2,    // USD in test database
    foreign_currency_id:    1,    // FC in test database
    rate:                   930,
    date:                   new Date()
  };

  // login before each request
  beforeEach(helpers.login(agent));

  it('GET /exchange returns a list of exchange rates', function () {
    return agent.get('/exchange')
      .then(function (res) {
        expect(res).to.have.status(200);
      })
      .catch(helpers.handler);
  });


  it('POST /exchange creates a new exchange rate', function () {
    return agent.post('/exchange')
      .send(RATE)
      .then(function (res) {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property('id');
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
});
