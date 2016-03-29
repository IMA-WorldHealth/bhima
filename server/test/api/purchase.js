/* jshint expr:true */
var chai = require('chai');
var expect = chai.expect;

var helpers = require('./helpers');
var uuid    = require('node-uuid');

helpers.configure(chai);

/**
* The /purchase API endpoint
*
* This test suite implements full CRUD on the /purchase HTTP API endpoint.
*
* @todo - this API endpoint should be called /purchases
*/
describe('(/purchase) The /purchase API endpoint', function () {
  var agent = chai.request.agent(helpers.baseUrl);

  // purchase we will add during this test suite.
  var purchase_order = {
    uuid          : uuid.v4(),
    cost          : 546.7520,
    purchase_date : new Date('2016-02-19'),
    currency_id   : 1,
    creditor_uuid : '7ac4e83c-65f2-45a1-8357-8b025003d794',
    receiver_id: 1,
    project_id: 1,
    emitter_id : 1,
    purchaser_id : 1,
    is_direct : 1
  };

   var purchase_item = [{
    uuid : uuid.v4(),
    inventory_uuid : '289cc0a1-b90f-11e5-8c73-159fdc73ab02',
    quantity : 200,
    unit_price : 0.0538,
    total : 10.7520
  }, {
    uuid : uuid.v4(),
    inventory_uuid : 'c48a3c4b-c07d-4899-95af-411f7708e296',
    quantity : 16000,
    unit_price : 0.0335,
    total : 536.0000
  }];

  var purchase = {
    purchase_order : purchase_order,
    purchase_item : purchase_item
  };

  var invalidPurchase = {
    inv_purchase_order : {},
    inv_purchase_item : {}
  };

  var responseKeys = [
    'uuid', 'reference', 'cost', 'discount', 'purchase_date', 'paid', 'text', 'name', 'prenom', 'first',
    'last', 'creditor_uuid', 'timestamp', 'note', 'paid_uuid', 'confirmed', 'closed', 'is_direct', 'is_donation', 'emitter_id',
    'is_authorized', 'is_validate', 'confirmed_by', 'is_integration', 'purchaser_id', 'receiver_id'
  ];

  // ensure the client is logged in before executing the test suite
  before(helpers.login(agent));

  it('POST /purchase should create a new purchase order', function () {
    return agent.post('/purchase')
      .send(purchase)
      .then(function (res) {
        helpers.api.created(res);
        var purchaseUuid = res.body.uuid;
        return agent.get('/purchase/' + purchaseUuid);
      })
      .then(function (res) {
        var purchase = res.body;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(purchase.cost).to.equal(purchase_order.cost);
      })
      .catch(helpers.handler);
  });


  it('GET /purchase/:uuid should return a single JSON purchase order', function () {
    return agent.get('/purchase/' + purchase_order.uuid)
      .then(function (res) {
        var purchase = res.body;
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(purchase.uuid).to.exist;
      })
      .catch(helpers.handler);
  });

  it('GET /purchase?complete=1 returns a complete list of purchase', function () {
    return agent.get('/purchase?complete=1')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body[0]).to.contain.all.keys(responseKeys);
      })
      .catch(helpers.handler);
  });

  it('GET /purchase/:uuid returns 404 for an invalid purchase order', function () {
    return agent.get('/purchase/unkown')
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });


  it('POST /purchase returns 400 for an invalid purchase order request object', function () {
    return agent.post('/purchase')
      .send(invalidPurchase)
      .then(function (res) {
        helpers.api.errored(res, 400);
      });
  });

  it('PUT /purchase/:uuid should update an property of a purchase order', function () {
    return agent.put('/purchase/' + purchase_order.uuid)
      .send({ is_validate : 1 })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body.is_validate).to.not.equal(purchase_order.is_validate);
      })
      .catch(helpers.handler);
  });

  it('PUT /purchase/:uuid unable to update an invalid purchase order', function () {
    return agent.put('/purchase/invalid')
      .send({ is_integration : 1 })
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });
});
