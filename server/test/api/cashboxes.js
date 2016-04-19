/* jshint expr:true */
var chai = require('chai');
var expect = chai.expect;

/** import test helpers */
var helpers = require('./helpers');
helpers.configure(chai);

/** The /cashboxes API endpoint */
describe('(/cashboxes) The Cashboxes API endpoint', function () {
  'use strict';

  /** login before the first request */
  var agent = chai.request.agent(helpers.baseUrl);
  before(helpers.login(agent));

  /** @const */
  const numCashboxes = 2;
  const numAuxCashboxes = 1;
  const NUMBER_OF_CASHBOX_CURRENCIES = 2;
  const numCashboxCurrencies = 4;

  // new cashbox
  const BOX = {
    label:       'New Cashbox C',
    project_id:   helpers.data.PROJECT,
    is_auxiliary : 1,
  };

  // new cashbox account currency
  const BOX_CURRENCY = {
    currency_id:              1,
    account_id:               3631,
    transfer_account_id:      3631
  };



  it('GET /cashboxes returns a list of cashboxes', function () {
    return agent.get('/cashboxes')
      .then(function (res) {
        helpers.api.listed(res, numCashboxes);
        expect(res.body[0]).to.contain.keys('id', 'label');
      })
      .catch(helpers.handler);
  });

  it('GET /cashboxes?is_auxiliary=1 returns only auxiliary cashboxes', function () {
    return agent.get('/cashboxes?is_auxiliary=1')
      .then(function (res) {
        helpers.api.listed(res, numAuxCashboxes);
      })
      .catch(helpers.handler);
  });

  it('GET /cashboxes?detailed=1 returns a list of cashboxes with expanded properties', function () {
    return agent.get('/cashboxes?detailed=1')
      .then(function (res) {
        /** @todo - make sure this tests the "expanded" properties */
        helpers.api.listed(res, numCashboxCurrencies);
      })
      .catch(helpers.handler);
  });

  it('GET /cashboxes/:id should return a single cashbox with currencies', function () {
    return agent.get('/cashboxes/1')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body).to.contain.keys('currencies', 'id', 'label');
        expect(res.body.currencies).to.have.length(NUMBER_OF_CASHBOX_CURRENCIES);
      })
      .catch(helpers.handler);
  });

  it('GET /cashboxes/:id should return a 404 for invalid cashbox', function () {
    return agent.get('/cashboxes/invalid')
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('POST /cashboxes should create a new cashbox', function () {
    return agent.post('/cashboxes')
      .send({ cashbox : BOX })
      .then(function (res) {
        helpers.api.created(res);
        BOX.id = res.body.id;
        return agent.get('/cashboxes/' + BOX.id);
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body.label).to.equal(BOX.label);
        expect(res.body.is_auxiliary).to.equal(BOX.is_auxiliary);
      })
      .catch(helpers.handler);
  });

  it('PUT /cashboxes/:id should update the cashbox', function () {
    return agent.put('/cashboxes/' + BOX.id)
      .send({ is_auxiliary : 0 })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(res.body.label).to.equal(BOX.label);
        expect(res.body.is_auxiliary).to.equal(0);
      })
      .catch(helpers.handler);
  });

  it('GET /cashboxes/:id/currencies should return an empty list of cashbox currencies', function () {
    return agent.get('/cashboxes/' + BOX.id + '/currencies')
      .then(function (res) {
        helpers.api.listed(res, 0);
      });
  });

  it('POST /cashboxes/:id/currencies should create a new currency account', function () {
    return agent.post('/cashboxes/' + BOX.id + '/currencies')
      .send(BOX_CURRENCY)
      .then(function (res) {
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  it('GET /cashboxes/:id/currencies/:currencyId should return a single cashbox currency reference', function () {
    return agent.get('/cashboxes/' + BOX.id + '/currencies/' + BOX_CURRENCY.currency_id)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).not.to.be.empty;
        expect(res.body.account_id).to.equal(BOX_CURRENCY.account_id);
        expect(res.body.transfer_account_id).to.equal(BOX_CURRENCY.transfer_account_id);
      });
  });

  it('GET /cashboxes/:id/currencies/unknown should return a single cashbox currency reference', function () {
    return agent.get('/cashboxes/' + BOX.id + '/currencies/unknown')
      .then(function (res) {
        helpers.api.errored(res, 404);
      });
  });


  it('PUT /cashboxes/:id/currencies/:currencyId should update a new currency account', function () {
    return agent.put('/cashboxes/' + BOX.id + '/currencies/' + BOX_CURRENCY.currency_id)
      .send({ transfer_account_id : 3635 })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.account_id).to.equal(BOX_CURRENCY.account_id);
      })
      .catch(helpers.handler);
  });

  // why does this route exit?! Why should this not fail???
  it('PUT /cashboxes/:id/currencies/undefined should successfully return nothing', function () {
    return agent.put('/cashboxes/' + BOX.id + '/currencies/undefined')
      .send({ transfer_account_id : 3635 })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.empty;
      })
      .catch(helpers.handler);
  });

  it('DELETE /cashboxes/:id should delete the cashbox and associated currencies', function () {
    return agent.delete('/cashboxes/' + BOX.id)
    .then(function (res) {
      helpers.api.deleted(res);
      return agent.get('/cashboxes/' + BOX.id);
    })
    .then(function (res) {
      helpers.api.errored(res, 404);
    })
    .catch(helpers.handler);
  });

  it('DELETE /cashboxes/:id should return a 404 for an unknown cashbox id', function () {
    return agent.delete('/cashboxes/unknown')
    .then(function (res) {
      helpers.api.errored(res, 404);
    })
    .catch(helpers.handler);
  });
});
