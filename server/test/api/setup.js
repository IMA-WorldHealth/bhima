/**
 * @overview setup
 *
 * @description
 * This file runs before all other mocha tests, attaching global variables used in tests.
 *
 * @requires chai
 * @requires q
 * @requires chai-http
 * @requires chai-datetime
 *
 */
'use strict';

// import plugins
const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiDatetime =  require('chai-datetime');

/*
 * Configure NodeJS/Mocha to continue working even with invalid TLS certs
 * This explicitly disables cert errors for the parent Node process, and
 * should only be done for testing cases.
 */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

// base URL for all tests
const port = process.env.PORT || 8080;
const baseUrl = `https://localhost:${port}`;
global.baseUrl = baseUrl;

// runs before any tests in the repository
before(() => {
  console.log('Setting up test suite...');

  // workaround for low node versions
  if (!global.Promise) {
    const q = require('q');
    chai.request.addPromises(q.Promise);
  }

  // attach plugins
  chai.use(chaiHttp);
  chai.use(chaiDatetime);

  // set global variables
  global.chai = chai;
  global.expect = chai.expect;
  global.agent = chai.request.agent(baseUrl);
  const agent = global.agent;

  // base user defined in test data
  const user = { username : 'superuser', password : 'superuser', project: 1 };

  // trigger login
  return (() => agent.post('/login').send(user))();
});

// runs after all tests are completed
after(() => {
  console.log('Test suite completed.');
});


