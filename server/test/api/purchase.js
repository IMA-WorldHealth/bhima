/* global describe, it, beforeEach */

var chai = require('chai');
var expect = chai.expect;
var date = new Date();

var helpers = require('./helpers');
helpers.configure(chai);

/**
* The /projects API endpoint
*
* This test suite implements full CRUD on the /projects HTTP API endpoint.
*/
describe('The /Purchase Order API endpoint', function () {
  var agent = chai.request.agent(helpers.baseUrl);


  // purchase we will add during this test suite.
  var purchase_order = {
      uuid          : '858f7a85-16d9-4ae5-b5c0-1fe007a8d2e',
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

   var purchase_item = [
    { 
      uuid : '017dbe1e-c37c-11e5-a86e-843a4b0cdadc', 
      inventory_uuid : '289cc0a1-b90f-11e5-8c73-159fdc73ab02',
      quantity : 200,
      unit_price : 0.0538,
      total : 10.7520 
    },
    { 
      uuid : 'ab8528de-1b0a-41df-84b4-88eff430f2f7',       
      inventory_uuid : 'c48a3c4b-c07d-4899-95af-411f7708e296',
      quantity : 16000,
      unit_price : 0.0335,
      total : 536.0000 
    }    
   ]; 

  var purchase = {
    purchase_order : purchase_order,
    purchase_item : purchase_item
  };


  // login before each request  
  beforeEach(helpers.login(agent));

  it('POST /purchase should create a new purchase order', function () {

    return agent.post('/purchase')
      .send(purchase)
      .then(function (res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        var purchaseUuid = res.body.uuid;
        return agent.get('/purchase/' + purchaseUuid);
      })
      .then(function (res) {
        var purchase = res.body.purchase[0];

        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(purchase.cost).to.equal(purchase_order.cost);
      })
      .catch(helpers.handler);
  });

  it('GET /purchase/:uuid should return a single JSON purchase order', function () {
    return agent.get('/purchase/' + purchase_order.uuid)
      .then(function (res) {
        var purchase = res.body.purchase[0];

        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(purchase.uuid).to.exist;
      })
      .catch(helpers.handler);
  });

});
