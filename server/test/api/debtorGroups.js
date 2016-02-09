/* global describe, it, beforeEach */

var chai = require('chai');
var expect = chai.expect;

var helpers = require('./helpers');
var uuid    = require('../../lib/guid');
helpers.configure(chai);

describe('The /debtor_groups HTTP API ENDPOINT', function () {
  var agent = chai.request.agent(helpers.baseUrl);

  var inspectDebtorGroup;
  // Logs in before each test
  beforeEach(helpers.login(agent));

  it('GET /debtor_groups returns a list of debtor groups', function () {
    var INITIAL_TEST_DEBTORS = 2;

    return agent.get('/debtor_groups')
      .then(function (result) {
        expect(result).to.have.status(200);
        expect(result.body).to.not.be.empty;
        expect(result.body).to.have.length(INITIAL_TEST_DEBTORS);

        inspectDebtorGroup = result.body[0].uuid;
      })
      .catch(helpers.handler);
  });

  it('GET /debtor_groups/:uuid returns all details for a valid debtor group', function () {
    return agent.get('/debtor_groups/' + inspectDebtorGroup)
      .then(function (result) {
        var debtorGroup;
        var expectedKeySubset = ['uuid', 'account_id', 'name', 'location_id'];

        expect(result).to.have.status(200);

        debtorGroup = result.body;
        expect(debtorGroup).to.contain.all.keys(expectedKeySubset);
      })
      .catch(helpers.handler);
  });

  it('GET /debtor_groups/:uuid returns not found for invalid id', function () {
    return agent.get('/debtor_groups/invalid')
      .then(function (result) {
        expect(result).to.have.status(404);
        expect(result.body).to.not.be.empty;
      })
      .catch(helpers.handler);
  });

  it('GET /debtor_groups/:uuid/invoices returns all invoices for a debtor group', function () {
    return agent.get('/debtor_groups/' + inspectDebtorGroup + '/invoices')
      .then(function (result) {
        expect(result).to.have.status(200);
      })
      .catch(helpers.handler);
  });

  it('GET /debtor_groups/unknow/invoices returns a NOT FOUND (404) for an unknow {uuid}', function () {
    return agent.get('/debtor_groups/unknow/invoices')
      .then(function (result) {
        expect(result).to.have.status(404);
      })
      .catch(helpers.handler);
  });

  it('GET /debtor_groups/:uuid/invoices returns only balanced invoices for a debtor group', function () {
    return agent.get('/debtor_groups/' + inspectDebtorGroup + '/invoices?balanced=1')
      .then(function (result) {
        expect(result).to.have.status(200);
      })
      .catch(helpers.handler);
  });

});
