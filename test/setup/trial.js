/* eslint global-require:off */

function makeApp() {
  // dummy express application - will only test the required endpoint.
  const app = require('express')();

  // load the database connection for configuration
  const db = require('../../server/lib/db');

  const host = 'localhost';
  const user = 'bhima';
  const password = 'HISCongo2013';
  const database = 'bhima_test';

  // does this propagate to the child processes?
  db.setPoolOptions({
    host,
    user,
    password,
    database,
  });

  const m = require('../../server/controllers/admin/transactionType');

  app.post('/transaction_type', m.create);
  app.get('/transaction_type', m.list);
  app.get('/transaction_type/:id', m.detail);
  app.put('/transaction_type/:id', m.update);
  app.delete('/transaction_type/:id', m.remove);

  app.listen(3001, () => console.log('listening on 3001'));
}

makeApp();

