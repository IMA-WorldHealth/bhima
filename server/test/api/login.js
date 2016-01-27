/* global describe, it, beforeEach */

// import testing framework
var chai = require('chai');
var expect = chai.expect;

/** import test helpers */
var helpers = require('./helpers');
helpers.configure(chai);

// begin login tests
describe('The /login API endpoint', function () {
  'use strict';

  var url = helpers.baseUrl;

  // set up valid user
  var validUser = { username : 'superuser', password : 'superuser', project: 1};
  var invalidUser = { username: 'unauthorized', password : 'unauthorized' };

  it('rejects access to non-existant routes', function () {
    return chai.request(url)
      .get('/non-existant')
      .then(function (res) {
        expect(res).to.have.status(401);
        expect(res.body).to.contain.all.keys(helpers.errorKeys);
        expect(res.body.code).to.equal('ERR_NOT_AUTHENTICATED');
      })
      .catch(helpers.handler);
  });

  it('rejects access to non-public routes', function () {
    return chai.request(url)
      .get('/journal')
      .then(function (res) {
        expect(res).to.have.status(401);
        expect(res.body).to.contain.all.keys(helpers.errorKeys);
        expect(res.body.code).to.equal('ERR_NOT_AUTHENTICATED');
      })
      .catch(helpers.handler);
  });

  it('allows access to public routes', function () {
    return chai.request(url)
      .get('/projects')
      .then(function (res) {
        expect(res).to.have.status(200);
      })
      .catch(helpers.handler);
  });

  it('rejects an unrecognized user', function () {
    return chai.request(url)
      .post('/login')
      .send(invalidUser)
      .then(function (res) {
        expect(res).to.have.status(401);
        expect(res.body).to.contain.all.keys(helpers.errorKeys);
        expect(res.body.code).to.equal('ERR_BAD_CREDENTIALS');
      })
      .catch(helpers.handler);
  });


  it('rejects a recognized user user without a project', function () {
    return chai.request(url)
      .post('/login')
      .send({ username : validUser.username, password : validUser.password })
      .then(function (res) {
        expect(res).to.have.status(401);
        expect(res.body).to.contain.all.keys(helpers.errorKeys);
        expect(res.body.code).to.equal('ERR_BAD_CREDENTIALS');
      })
      .catch(helpers.handler);
  });

  it('rejects a recognized user without a password', function () {
    return chai.request(url)
      .post('/login')
      .send({ username : validUser.username, project : validUser.project })
      .then(function (res) {
        expect(res).to.have.status(401);
        expect(res.body).to.contain.all.keys(helpers.errorKeys);
        expect(res.body.code).to.equal('ERR_BAD_CREDENTIALS');
      })
      .catch(helpers.handler);
  });

  it('allows a recognized user with username, password, and project', function () {
    return chai.request(url)
      .post('/login')
      .send(validUser)
      .then(function (res) {
        expect(res).to.have.status(200);
      })
      .catch(helpers.handler);
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
      .catch(helpers.handler);
  });
});
