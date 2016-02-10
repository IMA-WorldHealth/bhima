/* global describe, it, beforeEach */

var chai = require('chai');
var expect = chai.expect;

var helpers = require('./helpers');
helpers.configure(chai);

describe('(/debtors) The /debtors API', function () {
  var agent = chai.request.agent(helpers.baseUrl);

  var inspectDebtorGroup;
  var debtorUuid = '3be232f9-a4b9-4af6-984c-5d3f87d5c107';
  var emptyDebtorUuid = 'a11e6b7f-fbbb-432e-ac2a-5312a66dccf4';

  // Logs in before each test
  beforeEach(helpers.login(agent));

  it('GET /debtors/groups returns a list of debtor groups', function () {
    var INITIAL_TEST_DEBTORS = 2;

    return agent.get('/debtors/groups')
      .then(function (result) {
        expect(result).to.have.status(200);
        expect(result.body).to.not.be.empty;
        expect(result.body).to.have.length(INITIAL_TEST_DEBTORS);

        inspectDebtorGroup = result.body[0].uuid;
      })
      .catch(helpers.handler);
  });

  it('GET /debtors/groups/:id returns all details for a valid debtor group', function () {
    return agent.get('/debtors/groups/' + inspectDebtorGroup)
      .then(function (result) {
        var debtorGroup;
        var expectedKeySubset = ['uuid', 'account_id', 'name', 'location_id'];

        expect(result).to.have.status(200);

        debtorGroup = result.body;
        expect(debtorGroup).to.contain.all.keys(expectedKeySubset);
      })
      .catch(helpers.handler);
  });

  it('GET /debtors/groups/:id returns not found for invalid id', function () {
    return agent.get('/debtors/groups/invalid')
      .then(function (result) {

        expect(result).to.have.status(404);
        expect(result.body).to.not.be.empty;
      })
      .catch(helpers.handler);
  });

 it('GET /debtors/:uuid/invoices returns a list of all invoices of a given debtor', function () {
    return agent.get('/debtors/:uuid/invoices'.replace(':uuid', debtorUuid))
      .then(function (result) {
        expect(result).to.have.status(200);
        expect(result.body).to.not.be.empty;
        expect(result.body).to.have.length(1);
      })
      .catch(helpers.handler);
  });

  it('GET /debtors/:uuid/invoices?balanced=0 returns a list of unbalance invoices of a given debtor', function () {
    return agent.get('/debtors/:uuid/invoices?balanced=0'.replace(':uuid', debtorUuid))
      .then(function (result) {
        expect(result).to.have.status(200);
        expect(result.body).to.not.be.empty;
        expect(result.body).to.have.length(1);
      })
      .catch(helpers.handler);
  });

  it('GET /debtors/:uuid/invoices?balanced=1 returns a list of balanced invoices of a given debtor', function () {
    return agent.get('/debtors/:uuid/invoices?balanced=1'.replace(':uuid', debtorUuid))
      .then(function (result) {
        expect(result).to.have.status(200);
        expect(result.body).to.have.length(0);
      })
      .catch(helpers.handler);
  });

  it('GET /debtors/:uuid/invoice should return an empty list if the debtor does not have any invoices', function () {
    return agent.get('/debtors/:uuid/invoices'.replace(':uuid', emptyDebtorUuid))
      .then(function (result) {
        expect(result).to.have.status(200);
        expect(result.body).to.be.empty;
      })
      .catch(helpers.handler);
  });
});
