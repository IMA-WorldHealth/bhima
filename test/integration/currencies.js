/* global expect, chai, agent */

const helpers = require('./helpers');

describe('(/currencies) currencies API routes', function () {
  'use strict';

  const currencyId = 1;
  const keys = [
    'id', 'name', 'note', 'format_key', 'symbol', 'min_monentary_unit'
  ];

  it('GET /currencies should return a list of currencies', function () {
    return agent.get('/currencies')
      .then(function (res) {
        helpers.api.listed(res, 2);
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

  it('GET /currencies/:id should return an error for unknown id', function () {
    return agent.get('/currencies/unknown')
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });
});
