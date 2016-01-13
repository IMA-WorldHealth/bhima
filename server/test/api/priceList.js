/*global describe, it, beforeEach, process*/

var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;
chai.use(chaiHttp);

// workaround for low node versions
if (!global.Promise) {
  var q = require('q');
  chai.request.addPromises(q.Promise);
}

// environment variables - disable certificate errors
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

// base URL
var url = 'https://localhost:8080';
var user = { username : 'superuser', password : 'superuser', project: 1};

/**
 * The /prices API endpoint
 */
describe('(/prices ) The price list API', function () {
  var agent = chai.request.agent(url);

  // temp error handler
  function handler(err) { throw err; }

  // login before each request
  beforeEach(function () {
    return agent
      .post('/login')
      .send(user);
  });


  // constants
  var PRICE_LIST_EMPTY = {
    uuid : 'da4be62a-4310-4088-97a4-57c14cab49c8',
    label : 'Test Empty Price List',
    description : 'A price list without items attached yet.'
  };
  var PRICE_LIST_TWO_ITEMS = {
    uuid : 'bc9f6833-850f-4ac1-8f04-a60b7b2b38dc8',
    label : 'Test Price List w/ Two Items',
    description : 'A price list with two items attached.',
    items : [] // TODO
  };
  var ITEMS = [{
    uuid : '9eded093-699b-4765-9659-eced7db1d487',
    inventory_uuid : 'd76ee730-704e-4144-b7ef-33695ff1c03a',
    label : 'Test $10 reduction on an item',
    is_percentage : false,
    value : 10
  }, {
    uuid : '6051c32a-a9f0-427c-884a-c2cad3da14d5',
    inventory_uuid : 'c48a3c4b-c07d-4899-95af-411f7708e296',
    label : 'Test 12% reduction on an item',
    is_percentage : true,
    value :12
  }];


  it('GET /prices returns an empty list of price lists', function () {
    return agent.get('/prices')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.be.json;
        expect(res.body).to.be.empty;
      })
      .catch(handler);
  });

  it('GET /prices/unknownId returns a 404 error', function () {
    return agent.get('/prices/unknownId')
      .then(function (res) {
        expect(res).to.have.status(404);
        expect(res.body).to.have.all.keys('code', 'httpStatus', 'reason');
      })
      .catch(handler);
  });


  it('POST /prices should create a price list (without price list items)', function () {
    return agent.post('/prices')
      .send({ list : PRICE_LIST_EMPTY })
      .then(function (res) {
        expect(res).to.have.status(201);
        expect(res.body).to.be.json;
        expect(res.body).to.have.all.keys('uuid');

        // attach the returned id
        PRICE_LIST_EMPTY.uuid =  res.body.uuid;
        return agent.get('/prices/' + PRICE_LIST_EMPTY.uuid);
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.all.keys('uuid', 'label', 'description', 'enterprise_id');
      })
      .catch(handler);
  });

  it('PUT /prices should update the (empty) price list\'s label', function () {
    var newLabel = 'Test Empty Price List (updated)' ;
    return agent.put('/prices/' + PRICE_LIST_EMPTY.uuid)
      .send({ list : { label : newLabel }})
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.be.json;
        expect(res.body).to.have.all.keys('uuid', 'label', 'description', 'enterprise_id');
        expect(res.body.label).to.equal(newLabel);
        expect(res.body.items).to.be.empty;
      })
      .catch(handler);
  });

  it('PUT /prices should update the (empty) price list with price list items', function () {
    return agent.put('/prices/' + PRICE_LIST_EMPTY.uuid)
      .send({ list : { items : ITEMS }})
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.be.json;
        expect(res.body).to.have.all.keys('uuid', 'label', 'description', 'enterprise_id');
        expect(res.body).to.deep.equal(PRICE_LIST_EMPTY);
      })
      .catch(handler);
  });

  it('GET /prices should return a list of one item', function () {
    return agent.get('/prices')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.be.json;
        expect(res.body).to.have.length(1);
      })
      .catch(handler);
  });

  it('DELETE /prices/unknownid should return a 404 error.', function () {
    return agent.delete('/prices/unknownid')
      .then(function (res) {
        expect(res).to.have.status(404);
        expect(res).to.be.json;
        expect(res.body).to.have.all.keys('code', 'httpStatus', 'reason');
      })
      .catch(handler);
  });

  it('DELETE /prices/:uuid should delete an existing price list', function () {
    return agent.delete('/prices/' + PRICE_LIST_EMPTY.uuid)
      .then(function (res) {
        expect(res).to.have.status(201);
        return agent.get('/prices/' + PRICE_LIST_EMPTY.uuid);
      })
      .then(function (res) {
        expect(res).to.have.status(404);
        expect(res).to.be.json;
        expect(res).to.have.all.keys('code', 'httpStatus', 'reason');
      })
      .catch(handler);
  });

});
