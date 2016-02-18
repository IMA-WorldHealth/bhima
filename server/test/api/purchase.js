/* global describe, it, beforeEach */

var chai = require('chai');
var expect = chai.expect;

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
      cost          : 1000,
      purchase_date : new Date('2015-10-10'),
      currency_id   : 1,
      creditor_uuid : '7ac4e83c-65f2-45a1-8357-8b025003d794',
      receiver_id: 1,
      project_id: 1,
      emitter_id : 1,
      purchaser_id : 1,
      is_direct : 1
    };

  // login before each request  
  beforeEach(helpers.login(agent));

  it('POST /purchase should create a new purchase order', function () {

    return agent.post('/purchase')
      .send(purchase_order)
      .then(function (res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        var purchaseUuid = res.body.uuid;
        return agent.get('/purchase/' + res.body.uuid);
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body[0].cost).to.equal(purchase_order.cost);
      })
      .catch(helpers.handler);
  });

  it('GET /purchase/:uuid should return a single JSON purchase order', function () {
    return agent.get('/purchase/' + purchase_order.uuid)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(res.body[0].uuid).to.exist;
      })
      .catch(helpers.handler);
  });


/*
  it('GET /projects returns a list of projects', function () {
    return agent.get('/projects')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(res.body[0]).to.have.keys('id', 'name');
      })
      .catch(helpers.handler);
  });
*/
/*  it('GET /projects/:id should not be found for unknown id', function () {
    return agent.get('/projects/unknownproject')
      .then(function (res) {
        expect(res).to.have.status(404);
        expect(res.body).to.not.be.empty;
        expect(res.body.code).to.equal('ERR_NOT_FOUND');
      })
      .catch(helpers.handler);
  });
*/
/*  it('GET /projects/:id should return a single JSON project', function () {
    return agent.get('/projects/1')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(res.body.id).to.exist;
      })
      .catch(helpers.handler);
  });
*/
/*  it('GET /projects/ ? COMPLETE = 1 returns a complete List of project  ', function () { 
    return agent.get('/projects?complete=1')
      .then(function (result) { 
        expect(result).to.have.status(200);
        expect(result).to.be.json;
        expect(result.body).to.have.length(INITIAL_PROJECTS);
        expect(result.body[0]).to.contain.all.keys(PROJECT_KEY); 
      })
      .catch(helpers.handler);
  });
*/
/*  it('GET /projects/ ? LOCKED = 0 returns a complete List of unlocked projects  ', function () { 
    return agent.get('/projects?locked=0')
      .then(function (result) { 
        expect(result).to.have.status(200);
        expect(result).to.be.json;
        expect(result.body[0].locked).to.equal(UNLOCKED);
        expect(result.body[0]).to.contain.all.keys(PROJECT_KEY);
        expect(result.body).to.have.length(INITIAL_PROJECTS);        
      })
      .catch(helpers.handler);
  });
*/
/*  it('GET /projects/ ? LOCKED = 1 returns a complete List of locked projects  ', function () { 
    return agent.get('/projects?locked=1')
      .then(function (result) { 
        expect(result).to.have.status(200);
        expect(result.body).to.be.empty;        
      })
      .catch(helpers.handler);
  });
*/
/*  it('GET /projects/ ? INCOMPLETE LOCKED = 0 returns a simple List of unlocked projects  ', function () { 
    return agent.get('/projects?incomplete_locked=0')
      .then(function (result) { 
        expect(result).to.have.status(200);
        expect(result).to.be.json;
        expect(result.body[0]).to.have.keys('id', 'name');
        expect(result.body).to.have.length(INITIAL_PROJECTS);
      })
      .catch(helpers.handler);
  });
*/
/*  it('GET /projects/ ? INCOMPLETE LOCKED = 1 returns a simple List of locked projects  ', function () { 
    return agent.get('/projects?incomplete_locked=1')
      .then(function (result) { 
        expect(result).to.have.status(200);
        expect(result.body).to.be.empty;
      })
      .catch(helpers.handler);
  });
*/
/*  it('POST /projects should create a new project', function () {

    return agent.post('/projects')
      .send(project)
      .then(function (res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        return agent.get('/projects/' + res.body.id);
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.name).to.equal(project.name);
        project.id = res.body.id;
      })
      .catch(helpers.handler);
  });

  it('PUT /projects should update an existing project', function () {
    return agent.put('/projects/' + project.id)
      .send({ name : 'Temp Project' })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.keys(PROJECT_KEY);
        expect(res.body.name).to.not.equal(project.name);
      })
      .catch(helpers.handler);
  });

  it('DELETE /projects/:id will send back a 404 if the prjects does not exist', function () {
    return agent.delete('/projects/unknownproject')
      .then(function (res) {
        expect(res).to.have.status(404);
        expect(res.body).to.be.empty;
      })
      .catch(helpers.handler);
  });
*/
/*  it('DELETE /projects/:id should delete an existing and unused project', function () {
    return agent.delete('/projects/' + project.id)
      .then(function (res) {
        expect(res).to.have.status(204);
      })
      .catch(helpers.handler);
  });*/
});
