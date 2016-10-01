/* global expect, chai, agent, baseUrl */
/* jshint expr : true */

const helpers = require('./helpers');

describe('(/login) The login API', function () {
  'use strict';

  const port = process.env.PORT || 8080;
  const url = `http://localhost:${port}`;

  // set up valid user
  const validUser = {
    username : 'superuser',
    password : 'superuser',
    project: 1
  };

  const invalidUser = {
    username: 'unauthorized',
    password: 'unauthorized'
  };

  it('rejects access to non-existant routes', function () {
    return chai.request(url)
      .get('/non-existant')
      .then(function (res) {
        helpers.api.errored(res, 401);
        expect(res.body.code).to.equal('ERRORS.UNAUTHORIZED');
      })
      .catch(helpers.handler);
  });

  it('rejects access to non-public routes', function () {
    return chai.request(url)
      .get('/journal')
      .then(function (res) {
        helpers.api.errored(res, 401);
        expect(res.body.code).to.equal('ERRORS.UNAUTHORIZED');
      })
      .catch(helpers.handler);
  });

  it('allows access to public routes', function () {
    return chai.request(url)
      .get('/projects/')
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
        helpers.api.errored(res, 401);
        expect(res.body.code).to.equal('ERRORS.UNAUTHORIZED');
      })
      .catch(helpers.handler);
  });


  it('rejects a recognized user user without a project', function () {
    return chai.request(url)
      .post('/login')
      .send({ username : validUser.username, password : validUser.password })
      .then(function (res) {
        helpers.api.errored(res, 401);
        expect(res.body.code).to.equal('ERRORS.UNAUTHORIZED');
      })
      .catch(helpers.handler);
  });

  it('rejects a recognized user without a password', function () {
    return chai.request(url)
      .post('/login')
      .send({ username : validUser.username, project : validUser.project })
      .then(function (res) {
        helpers.api.errored(res, 401);
        expect(res.body.code).to.equal('ERRORS.UNAUTHORIZED');
      })
      .catch(helpers.handler);
  });

  it('sets a user\'s session properties', function () {
    return chai.request(url)
      .post('/login')
      .send(validUser)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.keys('enterprise', 'user', 'project', 'path');
        expect(res.body.user).to.contain.all.keys('id', 'enterprise_id', 'display_name', 'project_id', 'username', 'email');
        expect(res.body.enterprise).to.contain.all.keys('id', 'currency_id', 'currencySymbol');
        expect(res.body.project).to.contain.all.keys('id', 'name', 'abbr', 'enterprise_id');
        expect(res.body.path[0]).to.contain.all.keys('path', 'unit_id', 'user_id');
      })
      .catch(helpers.handler);
  });
});
