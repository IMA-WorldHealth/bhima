/* global describe, it, beforeEach, process */

var chai = require('chai');
var expect = chai.expect;

/** import test helpers */
var helpers = require('./helpers');
helpers.configure(chai);

/**
* The /cashboxes API endpoint
*/
describe('The /cashboxes API endpoint', function () {
  'use strict';

  var agent = chai.request.agent(helpers.baseUrl);

  // constants
  var NUMBER_OF_CASHBOXES = 2;
  var NUMBER_OF_AUX_CASHBOXES = 1;
  var NUMBER_OF_CASHBOX_CURRENCIES = 2;
  var PROJECT_ID = 1;

  // new cashbox
  var BOX = {
    text:         'New Cashbox C',
    project_id:   PROJECT_ID,
    is_auxillary: 1,
    is_bank:      0
  };

  // new cashbox account currency
  var BOX_CURRENCY = {
    currency_id:              1,
    account_id:               3631,
    virement_account_id:      3631,
    gain_exchange_account_id: 3631,
    loss_exchange_account_id: 3631
  };


  /** login before each request */
  beforeEach(helpers.login(agent));

  it('GET /cashboxes returns a list of cashboxes', function () {
    return agent.get('/cashboxes')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(res.body[0]).to.contain.keys('id', 'text');
        expect(res.body).to.have.length(NUMBER_OF_CASHBOXES);
      })
      .catch(helpers.handler);
  });

  it('GET /cashboxes?is_auxillary=1 returns only auxillary cashboxes', function () {
    return agent.get('/cashboxes?is_auxillary=1')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(res.body).to.have.length(NUMBER_OF_AUX_CASHBOXES);
      })
      .catch(helpers.handler);
  });

  it('GET /cashboxes/:id should return a single cashbox with currencies', function () {
    return agent.get('/cashboxes/1')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body).to.contain.keys('currencies', 'id', 'text');
        expect(res.body.currencies).to.have.length(NUMBER_OF_CASHBOX_CURRENCIES);
      })
      .catch(helpers.handler);
  });

  it('GET /cashboxes/:id should return a 404 for invalid cashbox', function () {
    return agent.get('/cashboxes/invalid')
      .then(function (res) {
        expect(res).to.have.status(404);
      })
      .catch(helpers.handler);
  });

  it('POST /cashboxes should create a new cashbox', function () {
    return agent.post('/cashboxes')
      .send({ cashbox : BOX })
      .then(function (res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body.id).to.be.defined;

        // set the box id
        BOX.id = res.body.id;
        return agent.get('/cashboxes/' + BOX.id);
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body.text).to.equal(BOX.text);
        expect(res.body.is_auxillary).to.equal(BOX.is_auxillary);
      })
      .catch(helpers.handler);
  });

  it('PUT /cashboxes/:id should update the cashbox', function () {
    return agent.put('/cashboxes/' + BOX.id)
      .send({ is_auxillary : 0 })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(res.body.text).to.equal(BOX.text);
        expect(res.body.is_auxillary).to.equal(0);
      })
      .catch(helpers.handler);
  });

  it('GET /cashboxes/:id/currencies should return an empty list of cashbox currencies', function () {
    return agent.get('/cashboxes/' + BOX.id + '/currencies')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.be.empty;
      });
  });

  it('POST /cashboxes/:id/currencies should create a new currency account', function () {
    return agent.post('/cashboxes/' + BOX.id + '/currencies')
      .send(BOX_CURRENCY)
      .then(function (res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.contain.keys('id');
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
        expect(res.body.virement_account_id).to.equal(BOX_CURRENCY.virement_account_id);
        expect(res.body.gain_exchange_account_id).to.equal(BOX_CURRENCY.gain_exchange_account_id);
        expect(res.body.loss_exchange_account_id).to.equal(BOX_CURRENCY.loss_exchange_account_id);
      });
  });

  it('GET /cashboxes/:id/currencies/unknown should return a single cashbox currency reference', function () {
    return agent.get('/cashboxes/' + BOX.id + '/currencies/unknown')
      .then(function (res) {
        expect(res).to.have.status(404);
      });
  });


  it('PUT /cashboxes/:id/currencies/:currencyId should update a new currency account', function () {
    return agent.put('/cashboxes/' + BOX.id + '/currencies/' + BOX_CURRENCY.currency_id)
      .send({ gain_exchange_account_id : 3635 })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.account_id).to.equal(BOX_CURRENCY.account_id);
        expect(res.body.gain_exchange_account_id).not.to.equal(BOX_CURRENCY.gain_exchange_account_id);
        expect(res.body.loss_exchange_account_id).to.equal(BOX_CURRENCY.gain_exchange_account_id);
      })
      .catch(helpers.handler);
  });

  it('PUT /cashboxes/:id/currencies/undefined should successfully return nothing', function () {
    return agent.put('/cashboxes/' + BOX.id + '/currencies/undefined')
      .send({ gain_exchange_account_id : 3635 })
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
      expect(res).to.have.status(200);
      return agent.get('/cashboxes/' + BOX.id);
    })
    .then(function (res) {
      expect(res).to.have.status(404);
    })
    .catch(helpers.handler);
  });
});
