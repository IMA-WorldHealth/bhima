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
  var emptyPriceList = {
    uuid : 'da4be62a-4310-4088-97a4-57c14cab49c8',
    label : 'Test Empty Price List',
    description : 'A price list without items attached yet.'
  };

  var priceListItems = [{
    uuid : '9eded093-699b-4765-9659-eced7db1d487',
    inventory_uuid : '289cc0a1-b90f-11e5-8c73-159fdc73ab02',
    label : 'Test $10 reduction on an item',
    is_percentage : false,
    value : 10
  }, {
    inventory_uuid : 'c48a3c4b-c07d-4899-95af-411f7708e296',
    label : 'Test 12% reduction on an item',
    is_percentage : true,
    value : 12
  }];

  var complexPriceList = {
    label : 'Test Price List w/ Two Items',
    description : 'A price list with two items attached.',
    items : priceListItems
  };

  var invalidPriceList = {
    label : 'An invalid price list',
    items :[{
      inventory_uuid : null,
      label : 'You cannot have a null inventory uuid, if you were wondering...',
      is_percentage : false,
      value : 1.2
    }]
  };


  it('GET /prices returns an empty list of price lists', function () {
    return agent.get('/prices')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
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
      .send({ list : emptyPriceList })
      .then(function (res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.have.all.keys('uuid');

        // attach the returned id
        emptyPriceList.uuid =  res.body.uuid;
        return agent.get('/prices/' + emptyPriceList.uuid);
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.all.keys('uuid', 'label', 'description', 'created_at', 'updated_at', 'items');
      })
      .catch(handler);
  });

  it('PUT /prices should update the (empty) price list\'s label', function () {
    var newLabel = 'Test Empty Price List (updated)' ;
    return agent.put('/prices/' + emptyPriceList.uuid)
      .send({ list : { label : newLabel }})
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.have.all.keys('uuid', 'label', 'description', 'created_at', 'updated_at', 'items');
        expect(res.body.label).to.equal(newLabel);
        expect(res.body.items).to.be.empty;
      })
      .catch(handler);
  });

  it('PUT /prices should update the (empty) price list with price list items', function () {
    return agent.put('/prices/' + emptyPriceList.uuid)
      .send({ list : { items : priceListItems }})
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.have.all.keys('uuid', 'label', 'description', 'created_at', 'updated_at', 'items');
      })
      .catch(handler);
  });

  it('GET /prices should return a list of one item', function () {
    return agent.get('/prices')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.have.length(1);
      })
      .catch(handler);
  });

  it('POST /prices should create a price list with two items', function () {
    return agent.post('/prices')
      .send({ list : complexPriceList })
      .then(function (res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.have.key('uuid');
        complexPriceList.uuid = res.body.uuid;
        return agent.get('/prices/' + complexPriceList.uuid);
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body).to.have.all.keys('uuid', 'label', 'description', 'created_at', 'updated_at', 'items');
        expect(res.body.items).to.have.length(2);
      })
      .catch(handler);
  });

  it('GET /prices should return a list of two items', function () {
    return agent.get('/prices')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.have.length(2);
      })
      .catch(handler);
  });
  
  it('POST /prices with an invalid price list item should not create a dangling price list', function () {
    return agent.post('/prices')
      .send({ list : invalidPriceList })
      .then(function (res) {
        expect(res).to.have.status(500);
        expect(res.body).to.not.have.key('uuid');

        // make sure we didn't gain a price list!
        return agent.get('/prices');
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.have.length(2);
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
    return agent.delete('/prices/' + emptyPriceList.uuid)
      .then(function (res) {
        expect(res).to.have.status(204);
        return agent.get('/prices/' + emptyPriceList.uuid);
      })
      .then(function (res) {
        expect(res).to.have.status(404);
        expect(res).to.be.json;
        expect(res.body).to.have.all.keys('code', 'httpStatus', 'reason');
      })
      .catch(handler);
  });
});
