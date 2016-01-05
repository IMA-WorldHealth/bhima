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

// begin login tests
describe('The /login API endpoint', function () {

  // set up valid user
  var validUser = { username : 'superuser', password : 'superuser', project: 1};
  var invalidUser = { username: 'unauthorized', password : 'unauthorized' };

  // throw errors
  function handler(err) { throw err; }

  it('rejects access to non-existant routes', function () {
    return chai.request(url)
      .get('/non-existant')
      .then(function (res) {
        expect(res).to.have.status(401);
        expect(res.body).to.deep.equal({
          code : 'ERR_NOT_AUTHENTICATED',
          httpStatus : 401,
          reason : 'You have not yet authenticated with the API to access the endpoint.  Send a POST to /login with proper credentials to sign in.'
        });
      })
      .catch(handler);
  });

  it('rejects access to non-public routes', function () {
    return chai.request(url)
      .get('/journal')
      .then(function (res) {
        expect(res).to.have.status(401);
        expect(res.body.code).to.equal('ERR_NOT_AUTHENTICATED');
      })
      .catch(handler);
  });

  it('allows access to public routes', function () {
    return chai.request(url)
      .get('/projects')
      .then(function (res) {
        expect(res).to.have.status(200);
      })
      .catch(handler);
  });

  it('rejects an unrecognized user', function () {
    return chai.request(url)
      .post('/login')
      .send(invalidUser)
      .then(function (res) {
        expect(res).to.have.status(401);
        expect(res.body.code).to.equal('ERR_BAD_CREDENTIALS');
      })
      .catch(handler);
  });


  it('rejects a recognized user user without a project', function () {
    return chai.request(url)
      .post('/login')
      .send({ username : validUser.username, password : validUser.password })
      .then(function (res) {
        expect(res).to.have.status(401);
        expect(res.body.code).to.equal('ERR_BAD_CREDENTIALS');
      })
      .catch(handler);
  });

  it('rejects a recognized user without a password', function () {
    return chai.request(url)
      .post('/login')
      .send({ username : validUser.username, project : validUser.project })
      .then(function (res) {
        expect(res).to.have.status(401);
        expect(res.body.code).to.equal('ERR_BAD_CREDENTIALS');
      })
      .catch(handler);
  });

  it('allows a recognized user with username, password, and project', function () {
    return chai.request(url)
      .post('/login')
      .send(validUser)
      .then(function (res) {
        expect(res).to.have.status(200);
      })
      .catch(handler);
  });

  it('sets a user\'s session properties', function () {
    return chai.request(url)
      .post('/login')
      .send(validUser)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.keys('enterprise', 'user', 'project');
        expect(res.body.user).to.contain.all.keys('id', 'enterprise_id', 'first', 'last', 'project_id', 'username', 'email');
        expect(res.body.enterprise).to.contain.all.keys('id', 'currency_id', 'currencySymbol');
        expect(res.body.project).to.contain.all.keys('id', 'name', 'abbr', 'enterprise_id');
      })
      .catch(handler);
  });
});
