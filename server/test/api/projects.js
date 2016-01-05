/*global describe, it, beforeEach, process*/

// import testing framework
var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;
chai.use(chaiHttp);

// workaround for low node versions
if (!global.Promise) {
  var q = require('q');
  chai.request.addPromises(q.Promise);
}

// do not throw self-signed certificate errors
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

// base URL
var url = 'https://localhost:8080';

// throw errors
function handler(err) { throw err; }

/**
* The /projects API endpoint
*
* This test suite implements full CRUD on the /projects HTTP API endpoint.
*/
describe('The /projects API endpoint', function () {
  var agent = chai.request.agent(url);

      // project we will add during this test suite.
  var project = {
      abbr : 'TMP',
      name  : 'Temporary Project',
      enterprise_id : 1,
      zs_id : 759
    };

  // login before each request
  beforeEach(function () {
    var user = { username : 'superuser', password : 'superuser', project: 1};
    return agent
      .post('/login')
      .send(user);
  });

  it('GET /projects returns a list of projects', function () {
    return agent.get('/projects')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(res.body[0]).to.have.keys('id', 'name');
      })
      .catch(handler);
  });

  it('GET /projects/:id should not be found for unknown id', function () {
    return agent.get('/projects/unknownproject')
      .then(function (res) {
        expect(res).to.have.status(404);
        expect(res.body).to.not.be.empty;
        expect(res.body.code).to.equal('ERR_NOT_FOUND');
      })
      .catch(handler);
  });

  it('GET /projects/:id should return a single JSON project', function () {
    return agent.get('/projects/1')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(res.body.id).to.exist;
      })
      .catch(handler);
  });

  it('POST /projects should create a new project', function () {

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
      .catch(handler);
  });

  it('PUT /projects should update an existing project', function () {
    return agent.put('/projects/' + project.id)
      .send({ name : 'Temp Project' })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.keys('id', 'name', 'abbr', 'enterprise_id', 'zs_id');
        expect(res.body.name).to.not.equal(project.name);
      })
      .catch(handler);
  });

  it('DELETE /projects/:id will send back a 404 if the prjects does not exist', function () {
    return agent.delete('/projects/unknownproject')
      .then(function (res) {
        expect(res).to.have.status(404);
        expect(res.body).to.be.empty;
      })
      .catch(handler);
  });

  it('DELETE /projects/:id should delete an existing and unused project', function () {
    return agent.delete('/projects/' + project.id)
      .then(function (res) {
        expect(res).to.have.status(204);
      })
      .catch(handler);
  });

});
