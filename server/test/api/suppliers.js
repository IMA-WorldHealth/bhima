/* jshint expr:true*/
const chai = require('chai');
const expect = chai.expect;
const uuid    = require('node-uuid');

const helpers = require('./helpers');
helpers.configure(chai);

/*
 * The /supplier API endpoint
 *
 * This test suite implements full CRUD on the /supplier HTTP API endpoint.
 */
describe('(/supplier) The supplier API endpoint', function () {
  const agent = chai.request.agent(helpers.baseUrl);
  before(helpers.login(agent));

  // supplier we will add during this test suite.
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

  var SUPPLIER_KEY = [
    'uuid', 'creditor_uuid', 'name', 'address_1', 'address_2',
    'email', 'fax', 'note', 'phone', 'international', 'locked'
  ];

  var FILTER = {
    name : 'UPD',
    limit : 20
  };

  var NOT_FOUND = {
    name : 'TEST',
    limit : 20
  };


  it('POST /supplier should create a new supplier ', function () {
    return agent.post('/suppliers')
      .send(supplier)
      .then(function (res) {
        helpers.api.created(res);
        return agent.get('/suppliers/' + res.body.uuid);
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.name).to.equal(supplier.name);
      })
      .catch(helpers.handler);
  });


  it('GET /supplier returns a list of supplier ', function () {
    return agent.get('/suppliers')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(res.body[0]).to.contain.all.keys(SUPPLIER_KEY);
      })
      .catch(helpers.handler);
  });

  it('GET /supplier/:id should return a 404 error for unknown id', function () {
    return agent.get('/suppliers/unknown')
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });


  it('GET /supplier/?locked=0 returns a complete list of unlocked supplier', function () {
    return agent.get('/suppliers?locked=0')
      .then(function (res) {
        helpers.api.listed(res, 1);
        expect(res.body[0].locked).to.equal(0);
        expect(res.body[0]).to.contain.all.keys(SUPPLIER_KEY);
      })
      .catch(helpers.handler);
  });

  it('GET /suppliers?locked=1 returns a complete list of locked supplier', function () {
    return agent.get('/suppliers?locked=1')
      .then(function (res) {
        helpers.api.listed(res, 0);
      })
      .catch(helpers.handler);
  });


  it('put /suppliers/:uuid should update an existing supplier', function () {
    return agent.put('/suppliers/' + supplier.uuid)
      .send({ name : 'SUPPLIER UPDATE' })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.keys(SUPPLIER_KEY);
        expect(res.body.name).to.equal('SUPPLIER UPDATE');
      })
      .catch(helpers.handler);
  });

  it('GET /suppliers/:uuid returns a single supplier', function () {
    return agent.get('/suppliers/' + supplier.uuid)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
      })
      .catch(helpers.handler);
  });

  /*
   * @todo - Theses tests dod not actually test anything.  A /search endpoint
   * should always return 200 OK.  A better test will check that content
   * filtering happened.
   *
   * Furthermore, this isn't how you use .send();
   */
  it('GET /supplier/search filtering the supplier list from the property name', function () {
    return agent.get('/suppliers/search')
      .send(FILTER)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
      })
      .catch(helpers.handler);
  });

  /* @todo - see above */
  it('GET /supplier/search the filter returns an empty list because of key words to send to server', function () {
    return agent.get('/suppliers/search')
      .send(NOT_FOUND)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.be.empty;
      })
      .catch(helpers.handler);
  });
});
