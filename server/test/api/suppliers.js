/* global describe, it, beforeEach */

var chai = require('chai');
var expect = chai.expect;
var uuid    = require('node-uuid');

var helpers = require('./helpers');
helpers.configure(chai);

/**
* The /supplier  API endpoint
*
* This test suite implements full CRUD on the /supplier  HTTP API endpoint.
*/
describe('The /supplier  API endpoint', function () {
  var agent = chai.request.agent(helpers.baseUrl);

      // Supplier we will add during this test suite.
  var supplier = {
    uuid : uuid.v4(),
    creditor_uuid : '7ac4e83c-65f2-45a1-8357-8b025003d794',
    name : 'SUPPLIER TEST A',
    address_1 : null,
    address_2 : null,
    email : null,
    fax : null,
    note : null,
    phone : '03949848595',
    international : 0,
    locked : 0
  };

  var UNLOCKED = 0;  
  var SUPPLIER_KEY = ['uuid', 'creditor_uuid', 'name', 'address_1', 'address_2',
   'email', 'fax', 'note', 'phone', 'international', 'locked'];
  
  // login before each request
  beforeEach(helpers.login(agent));

  it('POST /supplier  should create a new Supplier ', function () {
    return agent.post('/suppliers')
      .send(supplier)
      .then(function (res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        return agent.get('/suppliers/' + res.body.uuid);
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.name).to.equal(supplier.name);
      })
      .catch(helpers.handler);
  });


  it('GET /supplier  returns a list of supplier ', function () {
    return agent.get('/suppliers')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(res.body[0]).to.contain.all.keys(SUPPLIER_KEY); 
      })
      .catch(helpers.handler);
  });

  it('GET /supplier/:id should not be found for unknown id', function () {
    return agent.get('/suppliers/unknownSupplier')
      .then(function (res) {
        expect(res).to.have.status(404);
        expect(res.body).to.not.be.empty;
        expect(res.body.code).to.equal('ERR_NOT_FOUND');
      })
      .catch(helpers.handler);
  });


  it('GET /supplier/ ? LOCKED = 0 returns a complete List of unlocked supplier   ', function () { 
    return agent.get('/suppliers?locked=0')
      .then(function (result) {
        expect(result).to.have.status(200);
        expect(result).to.be.json;
        expect(result.body[0].locked).to.equal(UNLOCKED);
        expect(result.body[0]).to.contain.all.keys(SUPPLIER_KEY);
        expect(result.body).to.have.length(1);        
      })
      .catch(helpers.handler);
  });

  it('GET /supplier/ ? LOCKED = 1 returns a complete List of locked supplier', function () { 
    return agent.get('/suppliers?locked=1')
      .then(function (result) { 
        expect(result).to.have.status(200);
        expect(result.body).to.have.length(0);
        expect(result.body).to.be.empty;
      })
      .catch(helpers.handler);
  });


  it('PUT /supplier  should update an existing Supplier ', function () {
    return agent.put('/suppliers/' + supplier.uuid)
      .send({ name : 'Temp Project' })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.keys(SUPPLIER_KEY);
        expect(res.body.name).to.not.equal('Temp Project');
      })
      .catch(helpers.handler);
  });

  it('GET /Supplier/:ID returns a single Supplier ', function () {
    return agent.get('/suppliers/' + supplier.uuid)
      .then(function (result) {
        expect(result).to.have.status(200);
        expect(result).to.be.json;
      })
      .catch(helpers.handler);
  });

});
