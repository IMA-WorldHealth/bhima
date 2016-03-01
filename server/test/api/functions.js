/* global describe, it, beforeEach */

var chai = require('chai');
var expect = chai.expect;
var uuid    = require('node-uuid');

var helpers = require('./helpers');
helpers.configure(chai);

/**
* The /function  API endpoint
*
* This test suite implements full CRUD on the /function  HTTP API endpoint.
*/
describe('The /function  API endpoint', function () {
  var agent = chai.request.agent(helpers.baseUrl);

      // Function we will add during this test suite.
  var fonction = {
    fonction_txt : 'Anestiologiste'
  };
 
  var FUNCTION_KEY = ['id', 'fonction_txt'];

  var DEFAULT = 2;

  // login before each request
  beforeEach(helpers.login(agent));


  it('GET /function  returns a list of function ', function () {
    return agent.get('/functions')
    .then(function (res) {
      helpers.api.listed(res, DEFAULT);
    })
    .catch(helpers.handler);
  });


  it('POST /function  should create a new Function', function () {
    return agent.post('/functions')
    .send(fonction)
    .then(function (res) {
      fonction.id = res.body.id;
      helpers.api.created(res);
    })
    .catch(helpers.handler);
  });

  it('GET /function/:id should not be found for unknown id', function () {
    return agent.get('/functions/unknownFunction')
    .then(function (res) {
      helpers.api.errored(res, 404);
    })
    .catch(helpers.handler);
  });

  it('PUT /function  should update an existing Function ', function () {
    return agent.put('/functions/' + fonction.id)
      .send({ fonction_txt : 'Imagerie Medicale' })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.keys(FUNCTION_KEY);
        expect(res.body.fonction_txt).to.equal('Imagerie Medicale');
      })
      .catch(helpers.handler);
  });

  it('GET /Function/:ID returns a single Function ', function () {
    return agent.get('/functions/' + fonction.id)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
      })
      .catch(helpers.handler);
  });

  it('DELETE /Function/:id will send back a 404 if the Function does not exist', function () {
    return agent.delete('/functions/inknowFunction')
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('DELETE /exchange/:id should delete a Function ', function () {
    return agent.delete('/functions/' + fonction.id)
      .then(function (res) {
        helpers.api.deleted(res);
      })
      .catch(helpers.handler);
  });

});
