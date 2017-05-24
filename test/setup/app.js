import express from 'express';
import bodyParser from 'body-parser';

// makeApp()
function makeApp() {
  const app = express();
  app.use(bodyParser.json({ limit : '8mb' }));
  app.use(bodyParser.urlencoded({ extended : false }));
  return app;
}

module.exports = makeApp;
