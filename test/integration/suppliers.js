/* global expect, chai, agent */
/* jshint expr : true */

'use strict';

const helpers = require('./helpers');
const uuid    = require('node-uuid');

/*
 * The /supplier API endpoint
 *
 * This test suite implements full CRUD on the /supplier HTTP API endpoint.
 */
describe('(/suppliers) The supplier API endpoint', function () {

  // supplier we will add during this test suite.
  let supplier = {
    uuid : uuid.v4(),
    creditor_group_uuid : '8bedb6df-6b08-4dcf-97f7-0cfbb07cf9e2',
    display_name : 'SUPPLIER TEST A',
    address_1 : null,
    address_2 : null,
    email : null,
    fax : null,
    note : null,
    phone : '03949848595',
    international : 0,
    locked : 0
  };

  let responseKeys = [
    'uuid', 'creditor_uuid', 'display_name', 'address_1', 'address_2',
    'email', 'fax', 'note', 'phone', 'international', 'locked'
  ];

  let FILTER = {
    display_name : 'UPD',
    limit : 20
  };

  let NOT_FOUND = {
    display_name : 'TEST',
    limit : 20
  };


  it('POST /suppliers should create a new supplier ', function () {
    return agent.post('/suppliers')
      .send(supplier)
      .then(function (res) {
        helpers.api.created(res);
        return agent.get('/suppliers/' + res.body.uuid);
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.display_name).to.equal(supplier.display_name);
      })
      .catch(helpers.handler);
  });


  it('GET /suppliers returns a list of supplier ', function () {
    return agent.get('/suppliers')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        helpers.api.listed(res, 2);
      })
      .catch(helpers.handler);
  });

  it('GET /suppliers/:id should return a 404 error for unknown id', function () {
    return agent.get('/suppliers/unknown')
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });


  it('GET /suppliers/?locked=0 returns a complete list of unlocked supplier', function () {
    return agent.get('/suppliers?locked=0')
      .then(function (res) {
        helpers.api.listed(res, 2);
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


  it('PUT /suppliers/:uuid should update an existing supplier', function () {
    return agent.put('/suppliers/' + supplier.uuid)
      .send({ display_name : 'SUPPLIER UPDATE' })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.keys(responseKeys);
        expect(res.body.display_name).to.equal('SUPPLIER UPDATE');
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
   * @todo - Theses tests does not actually test anything.  A /search endpoint
   * should always return 200 OK.  A better test will check that content
   * filtering happened.
   *
   * Furthermore, this isn't how you use .send();
   */
  it('GET /suppliers/search filtering the supplier list from the property display_name', function () {
    return agent.get('/suppliers/search')
      .send(FILTER)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
      })
      .catch(helpers.handler);
  });

  /* @todo - see above */
  it('GET /suppliers/search the filter returns an empty list because of key words to send to server', function () {
    return agent.get('/suppliers/search')
      .send(NOT_FOUND)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.be.empty;
      })
      .catch(helpers.handler);
  });
});
