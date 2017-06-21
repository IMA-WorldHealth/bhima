/* eslint global-require:off, no-unused-expressions:off, no-console:off */
import test from 'ava';
import chai from 'chai';
import chaiHttp from 'chai-http';
import * as helpers from '../integration/helpers';
import * as db from '../setup/db';
import makeApp from '../setup/app';

// use the http interface to get access to the request framework
chai.use(chaiHttp);

const expect = chai.expect;

let connection;
let agent;

const MYSQL_NAME = 'bhima_test';

test.before(async () => {
  const app = makeApp();

  console.log('[test] Connecting to database....');

  // first, let's setup the database
  connection = await db.clone(MYSQL_NAME);
  db.connect(connection);
  console.log(`[test] connection established to ${connection}.`);

  // load the module that is under test: transaction types
  const m = require('../../server/controllers/admin/users');

  // if we used a module pattern, we wouldn't have to do this.
  app.get('/users', m.list);
  app.post('/users', m.create);
  app.get('/users/:id', m.detail);
  app.put('/users/:id', m.update);
  app.delete('/users/:id', m.delete);
  app.get('/users/:id/projects', m.projects.list);
  app.get('/users/:id/permissions', m.permissions.list);
  app.post('/users/:id/permissions', m.permissions.create);
  app.put('/users/:id/password', m.password);

  agent = chai.request.agent(app);
});

const USER_ID = 2;

const newUser = {
  username      : 'newUser',
  password      : 'newUser',
  projects      : [1],
  email         : 'newUser@test.org',
  first         : 'new',
  last          : 'user',
  display_name  : 'New Utilisateur',
};

const badUser = {
  username : 'username',
  password : 'password',
};

test('GET /users returns a list of users', async t => {
  const res = await agent.get('/users');
  helpers.api.listed(res, 4);
  t.pass();
});

test('POST /users will add a valid user', async t => {
  const res = await agent.post('/users').send(newUser);
  helpers.api.created(res);
  t.pass();
});

test.only('POST /users will reject an invalid user', async t => {
  const res = await agent.post('/users').send(badUser);
  helpers.api.errored(res, 400);
  t.pass();
});

test('POST /users with empty object will send 400 error code', async t => {
  const res = await agent.post('/users').send({});
  helpers.api.errored(res, 400);
  t.pass();
});

test('GET /users/:id/projects find no projects assigned to RegularUser.', async t => {
  const res = await agent.get(`/users/${USER_ID}/projects`);
  helpers.api.listed(res, 1);
  t.pass();
});

test('GET /users/:id will find RegularUser', async t => {
  const res = await agent.get(`/users/${USER_ID}`);
  expect(res).to.have.status(200);
  expect(res).to.be.json;
  expect(res.body.email).to.equal(newUser.email);
  expect(res.body.display_name).to.equal(newUser.display_name);
  t.pass();
});

test.skip('PUT /users/:id will update the newly added user', async t => {
  const res = await agent.put(`/users/${USER_ID}`).send({ email : 'email@test.org' });

  expect(res).to.have.status(200);
  expect(res).to.be.json;
  t.is(res.body.username, newUser.username);
  t.is(res.body.email, newUser.email);

  const user = await agent.get(`/users/${USER_ID}`);
  expect(user).to.have.status(200);
  expect(user.body.email).to.equal('email@test.org');
  t.pass();
});

test.skip('PUT /users/:id will update a user\'s projects', async t => {
  const res = agent.put(`/users/${USER_ID}`).send({ projects : [1, 2] });

  expect(res).to.have.status(200);
  expect(res).to.be.json;
  expect(res.body.username).to.equal(newUser.username);
  expect(res.body.projects).to.deep.equal([1, 2]);
  t.pass();
});

test.skip('PUT /users/:id will NOT update RegularUser\'s password', async t => {
  const res = await agent.put(`/users/${USER_ID}`).send({ password : 'I am super secret.' });
  helpers.api.errored(res, 400);
  t.is(res.body.code, 'ERRORS.PROTECTED_FIELD');
  t.pass();
});

test.skip('PUT /users/:id/password will update the new user\'s password', async t => {
  const res = await agent.put(`/users/${USER_ID}/password`).send({ password : 'I am super secret.' });
  expect(res).to.have.status(200);
  expect(res).to.be.json;
  t.pass();
});

test('GET /users/:id/permissions will have empty permissions for new user', async t => {
  const res = await agent.get(`/users/${USER_ID}/permissions`);
  expect(res).to.have.status(200);
  expect(res.body).to.be.empty;
  t.pass();
});

test('POST /users/:id/permissions will create user permissions', async t => {
  let res = await agent.post(`/users/${USER_ID}/permissions`)
    .send({ permissions : [0] }); // just the root node

  expect(res).to.have.status(201);

  res = await agent.get(`/users/${USER_ID}/permissions`);
  helpers.api.listed(res, 1);
  expect(res.body[0]).to.have.keys('id', 'unit_id');
  expect(res.body[0].unit_id).to.equal(0);
  t.pass();
});

// a user is allowed to delete all permissions for a give user.
test('POST /users/:id/permissions with no permissions will succeed', async t => {
  let res = await agent.post(`/users/${USER_ID}/permissions`).send({ permissions : [] });
  expect(res).to.have.status(201);
  res = await agent.get(`/users/${USER_ID}/permissions`);

  expect(res).to.have.status(200);
  expect(res.body).to.be.empty;
  t.pass();
});


test.skip('PUT /users/:id/password will update a user\'s password', async t => {
  const res = await agent.put(`/users/${USER_ID}/password`).send({ password : 'WOW' });
  expect(res).to.have.status(200);
  expect(res.body).to.not.be.empty;
  t.pass();
});


test('DELETE /users/:id will not delete a user who has permissions (RegularUser)', async t => {
  const res = await agent.delete(`/users/${USER_ID}`);
  helpers.api.errored(res, 400);
  t.pass();
});


test('GET /users/:id/permissions will be empty for deleted user', async t => {
  const res = await agent.get(`/users/${USER_ID}/permissions`);
  expect(res).to.have.status(200);
  expect(res.body).to.be.empty;
  t.pass();
});

// removes the database when all tests have completed
test.after(async () => {
  console.log(`[\\test] Cleaning up ${connection}.`);
  await db.remove(connection);
});
