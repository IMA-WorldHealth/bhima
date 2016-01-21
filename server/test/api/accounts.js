/* global describe, it, beforeEach */

var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;
chai.use(chaiHttp);

var helpers = require('./helpers');
helpers.configure(chai);

/**
* The /accounts API endpoint
*/
describe('The /accounts API endpoint', function () {
  var agent = chai.request.agent(helpers.baseUrl);


  // cheeky clone method for ES5 arrays
  function clone(array) {
    return array.filter(function () { return true; });
  }

  // login before each request
  beforeEach(helpers.login(agent));

  it('GET /accounts returns a list of accounts', function () {
    return agent.get('/accounts')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
      })
      .catch(helpers.handler);
  });

  it('GET /accounts returns the accounts in sorted order by account_number', function () {
    return agent.get('/accounts')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;

        // clone the accounts for comparison
        var accounts = res.body;
        var sorted = clone(accounts);

        sorted.sort(function (a, b) {
          return a.account_number > b.account_number ? 1 : -1;
        });

        expect(accounts).to.deep.equal(sorted);
      })
      .catch(helpers.handler);
  });

  it.skip('GET /accounts?type=ohada returns only OHADA accounts', function () {

    // NOTE
    // In the test data, we define one account (id: 3635) that is not OHADA
    // To figure out if our filter works, we query all accounts, then only
    // OHADA accounts, and then compare the two.
    var accounts;

    return agent.get('/accounts')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;

        accounts = res.body;
        return agent.get('/accounts?type=ohada');
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;

        var ohada = res.body;
        expect(accounts).to.not.deep.equal(ohada);
      })
      .catch(helpers.handler);
  });
});

