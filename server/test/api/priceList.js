/* global describe, it, beforeEach, process */

var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;

var q = require('q');

var url = 'https://localhost:8080';
var user = { username : 'superuser', password : 'superuser', project: 1 };

chai.use(chaiHttp);

// workaround for low node versions
if (!global.Promise) {
  var q = require('q');
  chai.request.addPromises(q.Promise);
}

// environment variables - disable certificate errors
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

/**
 * The /prices API endpoint
 */
describe('(/prices ) The price list API', function () {
  var agent = chai.request.agent(url);

  // constants
  var PRICE_LIST_EMPTY = {
    uuid : 'da4be62a-4310-4088-97a4-57c14cab49c8',
    label : 'Test Empty Price List',
    description : 'A price list without items attached yet.'
  };
  var PRICE_LIST_TWO_ITEMS = {
    uuid : 'bc9f6833-850f-4ac1-8f04-a60b7b2b38dc8',
    label : 'Test Price List w/ Two Items',
    description : 'A price list with two items attached.',
    items : [] // TODO
  };
});
