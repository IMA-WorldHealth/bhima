/* global describe, it, beforeEach */

var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;
chai.use(chaiHttp);

var helpers = require('./helpers');
helpers.configure(chai);

describe('The /debtors API', function () {
  var agent = chai.request.agent(helpers.baseUrl);

  var inspectDebtorGroup;

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
        expect(debtorGroup).to.contain.keys(expectedKeySubset);
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

 it.skip('METHOD : GET, PATH : /debtors/:uuid/invoices?balanced=3 returns an error bad value sent', function () {
    return agent.get('/debtors/3be232f9-a4b9-4af6-984c-5d3f87d5c107/invoices?balanced=3')
      .then(function (result) {
        expect(result).to.have.status(400);
        expect(result.body).to.not.be.empty;
        expect(result.body).to.have.all.keys('code', 'httpStatus', 'reason');
      })
      .catch(helpers.handler);
  });
  
  it('METHOD : GET, PATH : /debtors/:uuid/invoices?balanced=0 returns a list of unbalance invoices of a given debtor', function () {
    return agent.get('/debtors/3be232f9-a4b9-4af6-984c-5d3f87d5c107/invoices?balanced=0')
      .then(function (result) {
        expect(result).to.have.status(200);
        expect(result.body).to.not.be.empty;
        expect(result.body).to.have.length(1);
      })
      .catch(helpers.handler);
  });

it('METHOD : GET, PATH : /debtors/:uuid/invoices?balanced=1 returns a list of balanced invoices of a given debtor', function () {
    return agent.get('/debtors/3be232f9-a4b9-4af6-984c-5d3f87d5c107/invoices?balanced=1')
      .then(function (result) {
        expect(result).to.have.status(200);
        expect(result.body).to.have.length(0);
      })
      .catch(helpers.handler);
  });


 it('METHOD : GET, PATH : /debtors/:uuid/invoices returns a list of all invoices of a given debtor', function () {
    return agent.get('/debtors/3be232f9-a4b9-4af6-984c-5d3f87d5c107/invoices')
      .then(function (result) {
        expect(result).to.have.status(200);
        expect(result.body).to.not.be.empty;
        expect(result.body).to.have.length(1);
      })
      .catch(helpers.handler);
  });

 
});
