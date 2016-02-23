// Test Helpers

// import plugins
var expect = require('chai').expect;
var chaiHttp = require('chai-http');
var chaiDatetime =  require('chai-datetime');

/**
 * Configure NodeJS/Mocha to continue working even with invalid TLS certs
 * This explicitly disables cert errors for the parent Node process, and
 * should only be done for testing cases.
 */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

// base URL for all tests
var port = process.env.PORT || '8080';
exports.baseUrl = 'https://localhost:' + port;

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

  // attach plugins
  chai.use(chaiHttp);
  chai.use(chaiDatetime);
};

// generic error handler
exports.handler = function handler(err) {
  throw err;
};

/** bindings for API-specific response tests */
var api = exports.api = {};

/** ensure that objectA's key/values are contained in and identical to objectB's */
exports.identical = function identical(objectA, objectB) {
  'use strict';

  return Object.keys(objectA).every(function (key) {
    return objectA[key] === objectB[key];
  });
};


/**
 * Ensures that a create API request has returned the expected results for
 * further API usage.
 *
 * @method created
 * @param {object} res - the HTTP response object
 *
 * @example
 * var helpers = require('path/to/helpers.js');
 * var obj = { name : 'xyz', timestamp : new Date() }
 * agent.post('some/route')
 * .send(obj)
 * .then(function (res) {
 *   helpers.api.created(res);
 *
 *   // do something useful with the response, like further tests
 * })
 * .catch(helpers.hanlder);
 */
api.created = function created(res) {
  'use strict';

  // make sure the response has correct HTTP headers
  expect(res).to.have.status(201);
  expect(res).to.be.json;

  // ensure that we received a correct uuid in return
  expect(res.body).to.not.be.empty;

  // make sure that we either have a UUID or an ID
  expect(res.body).to.satisfy(function (o) { return o.id || o.uuid; });

  // id checks
  if (res.body.id) {
    expect(res.body).to.have.property('id');
    expect(res.body.uuid).to.be.a('number');

  // uuid checks
  } else {
    expect(res.body).to.have.property('uuid');
    expect(res.body.uuid).to.be.a('string');
    expect(res.body.uuid).to.have.length(36);
  }
};

/**
 * Ensures that an API request has properly errored with translateable text.
 *
 * @method errored
 * @param {object} res - the HTTP response object
 * @param {number} status - the appropiate HTTP status
 *
 * @example
 * var helpers = require('path/to/helpers.js');
 * agent.get('some/invalid/id')
 * .then(function (res) {
 *   helpers.api.errored(res);
 * })
 * .catch(helpers.hanlder);
 */
api.errored = function errored(res, status) {
  'use strict';

  var keys = [ 'code', 'reason' ];

  // make sure the response has the correct HTTP headers
  expect(res).to.have.status(status);
  expect(res).to.be.json;

  // the error codes should be sent back
  expect(res.body).to.not.be.empty;
  expect(res.body).to.contain.all.keys(keys);

  // ensure the error properties conform to standards
  expect(res.body.code).to.be.a('string');
  expect(res.body.reason).to.be.a('string');
};

/**
 * @TODO
 * Ensures that an original object has been updated.  Does not support
 * deep equality.
 *
 * @note - this will have some issues with dates.
 *
 * @method updated
 * @param {object} res - the HTTP response object
 * @param {object} original - the virgin object before changes
 * @param {array} changedKeys - a list of properties expected to change
 *
 * @example
 * agent.get('some/id') // TODO
 */
api.updated = function updated(res, original, changedKeys) {
  'use strict';

  // make sure the response has the correct HTTP headers
  expect(res).to.have.status(200);
  expect(res).to.be.json;

  // make sure we received a body
  expect(res.body).to.not.be.empty;

  // loop through the body, asserting that only the correct properties
  // have changed
  Object.keys(res).forEach(function (key) {

    // if the key is in "changedKeys", it should not equal the original
    if (changedKeys.indexOf(key) > -1) {
      expect(res.body[key]).to.not.equal(original[key]);
    } else {
      expect(res.body[key]).to.equal(original[key]);
    }
  });
};

/**
 * Ensures that a DELETE API request was successful and conforms to API
 * standards.
 *
 * @method deleted
 * @param {object} res - the HTTP response object
 *
 * @example
 * var helpers = require('path/to/helpers');
 *
 * agent.delete('some/id')
 * .then(function (res) {
 *   helpers.api.deleted(res);
 * })
 * .catch(helpers.handler);
 */
api.deleted = function deleted(res) {
  'use strict';

  // make sure that the response has the correct HTTP headers
  expect(res).to.have.status(204);
  expect(res.body).to.be.empty;
};

/**
 * Ensures that a GET API request was successful and conforms to API standards.
 * This tests is only for "list" methods, which return an array of records from
 * the database with a 200 success code expected.
 *
 * @method listed
 * @param {object} res - the HTTP response object
 * @param {number} len - the expected length of the array returned
 *
 * @example
 * var helpers = require('path/to/helpers');
 *
 * agent.get('some/route')
 * .then(function (res) {
 *   helpers.api.listed(res, 10);
 * })
 * .catch(helpers.handler);
 */
api.listed = function listed(res, len) {
  'use strict';

  // make sure that the response has the correct HTTP headers
  expect(res).to.have.status(200);
  expect(res).to.be.json;

  // assert that the length is the expected length.
  expect(res.body).to.have.length(len);
};

/** The error keys sent back by the API */
exports.errorKeys = [
  'code', 'reason'
];
