/* eslint global-require:off, no-unused-expressions:off, no-console:off */
import test from 'ava';
import chai from 'chai';
import chaiHttp from 'chai-http';
import * as helpers from '../integration/helpers';
import * as db from '../setup/db';
import makeApp from '../setup/app';

// use the http interface to get access to the request framework
chai.use(chaiHttp);

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
  const m = require('../../server/controllers/admin/transactionType');

  // if we used a module pattern, we wouldn't have to do this.
  app.post('/transaction_type', m.create);
  app.get('/transaction_type', m.list);
  app.get('/transaction_type/:id', m.detail);
  app.put('/transaction_type/:id', m.update);
  app.delete('/transaction_type/:id', m.remove);

  agent = chai.request.agent(app);
});

const TT_DEFAULT = 13;
const TT_UPDATE = 12;
const TT_LOOKUP = 4;

const newTT = {
  text : 'My New Transaction Type',
  type : 'income',
  prefix : 'NEW_TT',
  fixed : 0,
};

const updateTT = {
  text : 'My Updated Transaction Type',
  type : 'expense',
  prefix : 'UPDATED_TT',
};

test('GET /transaction_type returns all transaction type', async t => {
  const res = await agent.get('/transaction_type');
  helpers.api.listed(res, TT_DEFAULT);
  t.pass();
});

test('POST /transaction_type create a particular transaction type', async t => {
  const res = await agent.post('/transaction_type').send(newTT);
  helpers.api.created(res);
  t.pass();
});

test('GET /transaction_type/:id returns a particular transaction type', async t => {
  t.plan(2);
  const res = await agent.get(`/transaction_type/${TT_LOOKUP}`);
  t.is(res.body.id, TT_LOOKUP);
  t.is(res.body.text, 'VOUCHERS.SIMPLE.SUPPORT_INCOME');
});

test('PUT /transaction_type/:id updates a particular transaction type', async t => {
  const res = await agent.put(`/transaction_type/${TT_UPDATE}`).send(updateTT);
  const changedKeys = Object.keys(updateTT);
  helpers.api.updated(res, updateTT, changedKeys);
  t.pass();
});

test('DELETE /transaction_type/:id delete a particular transaction type', async t => {
  const res = await agent.delete(`/transaction_type/${TT_LOOKUP}`);
  helpers.api.deleted(res);
  t.pass();
});

// removes the database when all tests have completed
test.after(async () => {
  console.log(`[\\test] Cleaning up ${connection}.`);
  await db.remove(connection);
});
