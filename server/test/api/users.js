/* jshint expr:true */
const chai = require('chai');
const expect = chai.expect;

const helpers = require('./helpers');
helpers.configure(chai);

/**
 * The /users API endpoint
 *
 * This test suite implements full CRUD on the /users HTTP API endpoint.
 */
describe('(/users) Users and Permissions', function () {
  const agent = chai.request.agent(helpers.baseUrl);
  before(helpers.login(agent));

  var newUser = {
    username : 'newUser',
    password : 'newUser',
    projects : [1],
    email : 'newUser@test.org',
    first: 'new',
    last: 'user'
  };

  var badUser = {
    username : 'username',
    password : 'password',
  };


  it('GET /users returns a list of users', function () {
    return agent.get('/users')
      .then(function (res) {
        helpers.api.listed(res, 4);
      })
      .catch(helpers.handler);
  });

  it('POST /users will add a valid user', function () {
    return agent.post('/users')
      .send(newUser)
      .then(function (res) {
        helpers.api.created(res);

        // cache the user id
        newUser.id = res.body.id;
      })
      .catch(helpers.handler);
  });

  it('POST /users will reject an invalid user', function () {
    return agent.post('/users')
      .send(badUser)
      .then(function (res) {
        helpers.api.errored(res, 400);
        expect(res.body.code).to.be.equal('ERROR.ERR_MISSING_INFO');
      })
      .catch(helpers.handler);
  });

  it('POST /users with empty object will send 400 error code', function () {
    return agent.post('/users')
      .send({})
      .then(function (res) {
        helpers.api.errored(res, 400);
      })
      .catch(helpers.handler);
  });

  it('GET /users/:id/projects should not find one project assigned to the new user', function () {
    return agent.get('/users/' + newUser.id + '/projects')
      .then(function (res) {
        helpers.api.listed(res, 1);
      })
      .catch(helpers.handler);
  });

  it('GET /users/:id will find the newly added user', function () {
    return agent.get('/users/' + newUser.id)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.username).to.equal(newUser.username);
        expect(res.body.email).to.equal(newUser.email);
        expect(res.body.first).to.equal(newUser.first);
        expect(res.body.last).to.equal(newUser.last);
      })
      .catch(helpers.handler);
  });

  it('PUT /users/:id will update the newly added user', function () {
    return agent.put('/users/' + newUser.id)
      .send({ email : 'email@test.org' })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.username).to.equal(newUser.username);
        expect(res.body.email).to.not.equal(newUser.email);

        // re-query the database
        return agent.get('/users/' + newUser.id);
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body.email).to.equal('email@test.org');
      })
      .catch(helpers.handler);
  });

  it('PUT /users/:id with empty object will send 400 error code', function () {
    return agent.put('/users/' + newUser.id)
      .send({})
      .then(function (res) {
        helpers.api.errored(res, 400);
      })
      .catch(helpers.handler);
  });

  it('PUT /users/:id will update a user\'s projects', function () {
    return agent.put('/users/' + newUser.id)
      .send({ projects : [1, 2] })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.username).to.equal(newUser.username);
        expect(res.body.projects).to.deep.equal([ 1, 2 ]);

        // re-query the database
        return agent.get('/users/' + newUser.id);
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body.email).to.equal('email@test.org');
      })
      .catch(helpers.handler);
  });

  it('PUT /users/:id will NOT update the new user\'s password', function () {
    return agent.put('/users/' + newUser.id)
      .send({ password : 'I am super secret.' })
      .then(function (res) {
        helpers.api.errored(res, 400);
        expect(res.body.code).to.equal('ERRORS.PROTECTED_FIELD');
      })
      .catch(helpers.handler);
  });

  it('PUT /users/:id/password will update the new user\'s password', function () {
    return agent.put('/users/' + newUser.id + '/password')
      .send({ password : 'I am super secret.' })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
      })
      .catch(helpers.handler);
  });

  it('GET /users/:id/permissions will have empty permissions for new user', function () {
    return agent.get('/users/' + newUser.id + '/permissions')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.be.empty;
      })
      .catch(helpers.handler);
  });

  it('POST /users/:id/permissions will create user permissions', function () {
    return agent.post('/users/' + newUser.id + '/permissions')
      .send({ permissions : [0] }) // just the root node
      .then(function (res) {
        expect(res).to.have.status(201);
        return agent.get('/users/' + newUser.id + '/permissions');
      })
      .then(function (res) {
        helpers.api.listed(res, 1);

        expect(res.body[0]).to.have.keys('id', 'unit_id');
        expect(res.body[0].unit_id).to.equal(0);
      })
      .catch(helpers.handler);
  });

  // a user is allowed to delete all permissions for a give user.
  it('POST /users/:id/permissions with no permissions will succeed', function () {
    return agent.post('/users/' + newUser.id + '/permissions')
      .send({ permissions : [] })
      .then(function (res) {
        expect(res).to.have.status(201);
        return agent.get('/users/' + newUser.id + '/permissions');
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.be.empty;
      })
      .catch(helpers.handler);
  });


  it('PUT /users/:id/password will update a user\'s password', function () {
    return agent.put('/users/' + newUser.id + '/password')
      .send({ password: 'WOW' })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
      })
      .catch(helpers.handler);
  });


  it('DELETE /users/:id will delete the newly added user', function () {
    return agent.delete('/users/' + newUser.id)
      .then(function (res) {
        helpers.api.deleted(res);
        return agent.get('/users/' + newUser.id);
      })
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('DELETE /users/:id will send back a 404 if the user does not exist', function () {
    return agent.delete('/users/' + newUser.id)
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('GET /users/:id/permissions will be empty for deleted user', function () {
    return agent.get('/users/' + newUser.id + '/permissions')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.be.empty;
      })
      .catch(helpers.handler);
  });
});
