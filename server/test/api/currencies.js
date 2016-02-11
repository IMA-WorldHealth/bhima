
var chai = require('chai');
var expect = chai.expect;

/** import test helpers */
var helpers = require('./helpers');
helpers.configure(chai);

describe('(/currencies) currencies API routes', function () {
  'use strict';

  var agent = chai.request.agent(helpers.baseUrl);
  var currencyId = 1;
  var keys = [
    'id', 'name', 'note', 'format_key', 'symbol', 'min_monentary_unit'
  ];

  /** login before each request */
  beforeEach(helpers.login(agent));

  it('GET /currencies should return a list of currencies', function () {
    return agent.get('/currencies')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.have.length(2);
      })
      .catch(helpers.handler);
  });

  it('GET /currencies/:id should return a single currency', function () {
    return agent.get('/currencies/'.concat(currencyId))
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.have.keys(keys);
      })
      .catch(helpers.handler);
  });

  it('GET /currencies/unknownid should return an error', function () {
    return agent.get('/currencies/unknownId')
      .then(function (res) {

        // assert that the result is an error
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });



});
