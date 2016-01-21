/* global describe, it, beforeEach */

var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;
chai.use(chaiHttp);

// import test helpers
var helpers = require('./helpers');
helpers.configure(chai);

/**
* The /discounts API endpoint
*/
describe('(/discounts) Discounts Interface ::', function () {
  'use strict';

  // bind agent for authenticated requrests
  var agent = chai.request.agent(helpers.baseUrl);

  // login before each request
  beforeEach(helpers.login(agent));

  var ACCOUNT_ID = 3636;  // Test Inventory Account
  var INVENTORY_UUID = '289cc0a1-b90f-11e5-8c73-159fdc73ab02'; // INV1
  var KEYS = [
    'id', 'account_id', 'inventory_uuid', 'account_number', 'inventoryLabel',
    'label', 'description', 'value'
  ];

  var mockDiscount = {
    label:          'Test Discount A',
    description:    'This is a mock discount for testing purposes.',
    account_id:     ACCOUNT_ID,
    inventory_uuid: INVENTORY_UUID,
    value:          15
  };

  it('GET /discounts/undefined returns a 404 error', function () {
    return agent.get('/discounts/undefined')
    .then(function (res) {
      expect(res).to.have.status(404);
      expect(res.body).to.have.keys('code', 'httpStatus', 'reason');
      expect(res.body.code).to.equal('ERR_NOT_FOUND');
    })
    .catch(helpers.handler);
  });

  it('GET /discounts returns an empty array of discounts', function () {
    return agent.get('/discounts')
    .then(function (res) {
      expect(res).to.have.status(200);
      expect(res).to.be.json;
      expect(res.body).to.be.empty;
    })
    .catch(helpers.handler);
  });

  it('POST /discounts should create a new discount record', function () {
    return agent.post('/discounts')
    .send({ discount : mockDiscount })
    .then(function (res) {
      expect(res).to.have.status(201);
      expect(res).to.be.json;
      expect(res.body).to.have.key('id');

      // bind the returned ID
      mockDiscount.id = res.body.id;

      // ensure it actually exists in the database
      return agent.get('/discounts/' + mockDiscount.id);
    })
    .then(function (res) {
      expect(res).to.have.status(200);
      expect(res).to.be.json;
      expect(res.body).to.have.keys(KEYS);

      // exhaustively make sure all properties were inserted correctly
      var isIdentical = helpers.identical(mockDiscount, res.body);
      expect(isIdentical).to.equal(true);
    })
    .catch(helpers.handler);
  });

  it('GET /discounts returns an array of precisely one value', function () {
    return agent.get('/discounts')
    .then(function (res) {
      expect(res).to.have.status(200);
      expect(res).to.be.json;
      expect(res.body).to.have.length(1);
    })
    .catch(helpers.handler);
  });

  it('PUT /discounts/:id updates a discount record', function () {
    var newLabel = 'I\'m a new label!';
    return agent.put('/discounts/' + mockDiscount.id)
    .send({ label : newLabel })
    .then(function (res) {
      expect(res).to.have.status(200);
      expect(res).to.be.json;
      expect(res.body).to.have.keys(KEYS);
      expect(res.body.label).to.equal(newLabel);
      expect(res.body.id).to.equal(mockDiscount.id);
    })
    .catch(helpers.handler);
  });

  it('DELETE /discounts/undefined should return a 404 error', function () {
    return agent.delete('/discounts/undefined')
    .then(function (res) {
      expect(res).to.have.status(404);
      expect(res.body).to.not.be.empty;
    })
    .catch(helpers.handler);
  });

  it('DELETE /discounts/:id should successfully delete a discount', function () {
    return agent.delete('/discounts/' + mockDiscount.id)
    .then(function (res) {
      expect(res).to.have.status(204);
      expect(res.body).to.be.empty;
    })
    .catch(helpers.handler);
  });
});
