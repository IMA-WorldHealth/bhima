/* jshint expr:true*/
const chai = require('chai');
const expect = chai.expect;
const helpers = require('./helpers');
helpers.configure(chai);

/*
 * The /discounts API endpoint
 */
describe('(/discounts) Discounts Interface', function () {
  const agent = chai.request.agent(helpers.baseUrl);
  before(helpers.login(agent));

  var ACCOUNT_ID = 3636;  // Test Inventory Account
  var INVENTORY_UUID = '289cc0a1-b90f-11e5-8c73-159fdc73ab02'; // INV1
  var KEYS = [
    'id', 'account_id', 'inventory_uuid', 'number', 'inventoryLabel',
    'label', 'description', 'value'
  ];

  var mockDiscount = {
    label:          'Test Discount A',
    description:    'This is a mock discount for testing purposes.',
    account_id:     ACCOUNT_ID,
    inventory_uuid: INVENTORY_UUID,
    value:          15
  };

  var mockDiscountNegative = {
    label:          'Test Discount B',
    description:    'This is a mock (negative) discount for testing purposes.',
    account_id:     ACCOUNT_ID,
    inventory_uuid: INVENTORY_UUID,
    value:          -125.00
  };

  it('GET /discounts/undefined returns a 404 error', function () {
    return agent.get('/discounts/undefined')
    .then(function (res) {
      helpers.api.errored(res, 404);
    })
    .catch(helpers.handler);
  });

  it('GET /discounts returns an empty array of discounts', function () {
    return agent.get('/discounts')
    .then(function (res) {
      helpers.api.listed(res, 0);
    })
    .catch(helpers.handler);
  });

  it('POST /discounts should create a new discount record', function () {
    return agent.post('/discounts')
    .send({ discount : mockDiscount })
    .then(function (res) {

      helpers.api.created(res);

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

  it('POST /discounts should reject a discount record with a negative value', function () {
    return agent.post('/discounts')
    .send({ discount : mockDiscountNegative })
    .then(function (res) {
      helpers.api.errored(res, 400);
    })
    .catch(helpers.handler);
  });

  it('GET /discounts returns an array of precisely one value', function () {
    return agent.get('/discounts')
    .then(function (res) {
      helpers.api.listed(res, 1);
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
      helpers.api.errored(res, 404);
    })
    .catch(helpers.handler);
  });

  it('DELETE /discounts/:id should successfully delete a discount', function () {
    return agent.delete('/discounts/' + mockDiscount.id)
    .then(function (res) {
      helpers.api.deleted(res);
    })
    .catch(helpers.handler);
  });
});
