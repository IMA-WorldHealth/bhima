/* global describe, it, beforeEach */

var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;
chai.use(chaiHttp);

// import test helpers
var helpers = require('./helpers');
helpers.configure(chai);

/**
* @desc The /billing_services API endpoint
*/
describe('(/billing_services) Billing Services Interface ::', function () {
  'use strict';

  var agent = chai.request.agent(helpers.baseUrl);

  var billingServiceA = {
    account_id:  3628,  // Test Capital Account Two
    label:       'Test Billing Service A',
    description: 'This is definitely a billing service.',
    value:       13.0
  };

  /// test negative values
  var billingServiceB = {
    account_id:  3627,  // Test Capital Account One
    label:       'Test Billing Service B',
    description: 'Billing Services should not have negative values, right?',
    value:       -15.0
  };

  /** logs in before each request */
  beforeEach(helpers.login(agent));

  it('GET /billing_services should return an empty list of billing services', function () {
    return agent.get('/billing_services')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.empty;
      })
      .catch(helpers.handler);
  });

  it('GET /billing_services/undefined should reject (404) an unknown id', function () {
    return agent.get('/billing_services/undefined')
      .then(function (res) {
        expect(res).to.have.status(404);
        expect(res).to.be.json;
        expect(res.body).to.have.keys('code', 'reason', 'httpStatus');
      })
      .catch(helpers.handler);
  });

  it('POST /billing_services should create a new, valid billing service', function () {
    return agent.post('/billing_services')
      .send({ billingService : billingServiceA })
      .then(function (res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.have.key('id');

        // bind the database-generated ID
        billingServiceA.id = res.body.id;

        return agent.get('/billing_services/' + billingServiceA.id);
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.have.keys(
          'id', 'account_id', 'label', 'description', 'value',
          'account_number', 'created_at', 'updated_at'
        );

        // these props should be identical
        expect(res.body.id).to.equal(billingServiceA.id);
        expect(res.body.label).to.equal(billingServiceA.label);
        expect(res.body.description).to.equal(billingServiceA.description);
        expect(res.body.value).to.equal(billingServiceA.value);
      })
      .catch(helpers.handler);
  });

  it('POST /billing_services should reject an invalid billing service', function () {
    return agent.post('/billing_services')
      .send({ billingService : billingServiceB })
      .then(function (res) {
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.have.keys('code', 'reason', 'httpStatus');
      })
      .catch(helpers.handler);
  });

  it('PUT /billing_services should update a billing service', function () {
    var newLabel = 'Yadaya, I changed the label!';

    return agent.put('/billing_services/' +  billingServiceA.id)
      .send({ billingService : { label : newLabel }})
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;

        // these props should be identical
        expect(res.body.id).to.equal(billingServiceA.id);
        expect(res.body.label).to.equal(newLabel);
        expect(res.body.description).to.equal(billingServiceA.description);
        expect(res.body.value).to.equal(billingServiceA.value);
      })
      .catch(helpers.handler);
  });

  it('DELETE /billing_services/undefined should return a 404 error', function () {
    return agent.delete('/billing_services/undefined')
      .then(function (res) {
        expect(res).to.have.status(404);
        expect(res.body).to.have.keys('code', 'reason', 'httpStatus');
      })
      .catch(helpers.handler);
  });

  it('DELETE /billing_services/:id should delete an existing billing service', function () {
    return agent.delete('/billing_services/' + billingServiceA.id)
      .then(function (res) {
        expect(res).to.have.status(204);

        return agent.get('/billing_services/' + billingServiceA.id);
      })
      .then(function (res) {
        expect(res).to.have.status(404);
        expect(res.body).to.have.keys('code', 'reason', 'httpStatus');
      })
      .catch(helpers.handler);
  });
});
