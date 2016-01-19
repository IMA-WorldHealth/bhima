// Test Helpers

// Configure NodeJS/Mocha to continue working even with invalid TLS certs
// This explicitly disables cert errors for the parent Node process, and
// should only be done for testing cases.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

// base URL for all tests
exports.baseUrl = 'https://localhost:8080';

// login using the base URL and user
exports.login = function login(agent) {
  'use strict';

  // base user defined in test data
  var user = { username : 'superuser', password : 'superuser', project: 1};

  return function () {
    return agent
      .post('/login')
      .send(user);
  };
};

// generic configuration for chai
exports.configure = function configure(chai) {
  'use strict';

  // workaround for low node versions
  if (!global.Promise) {
    var q = require('q');
    chai.request.addPromises(q.Promise);
  }

};

// generic error handler
exports.handler = function handler(err) {
  throw err;
};
