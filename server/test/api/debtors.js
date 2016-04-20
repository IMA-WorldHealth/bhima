var chai = require('chai');
var expect = chai.expect;

var helpers = require('./helpers');
helpers.configure(chai);

describe('(/debtors) The /debtors API', function () {
  // Logs in before test suite
  const agent = chai.request.agent(helpers.baseUrl);
  before(helpers.login(agent));

  var inspectDebtorGroup;
  var debtorUuid = '3be232f9-a4b9-4af6-984c-5d3f87d5c107';
  var emptyDebtorUuid = 'a11e6b7f-fbbb-432e-ac2a-5312a66dccf4';


 it.skip('GET /debtors/:uuid/invoices returns a list of all invoices of a given debtor', function () {
    return agent.get('/debtors/:uuid/invoices'.replace(':uuid', debtorUuid))
      .then(function (res) {
        helpers.api.listed(res, 1);
      })
      .catch(helpers.handler);
  });

  it.skip('GET /debtors/:uuid/invoices?balanced=0 returns a list of unbalance invoices of a given debtor', function () {
    return agent.get('/debtors/:uuid/invoices?balanced=0'.replace(':uuid', debtorUuid))
      .then(function (res) {
        helpers.api.listed(res, 1);
      })
      .catch(helpers.handler);
  });

  it('GET /debtors/:uuid/invoices?balanced=1 returns a list of balanced invoices of a given debtor', function () {
    return agent.get('/debtors/:uuid/invoices?balanced=1'.replace(':uuid', debtorUuid))
      .then(function (res) {
        helpers.api.listed(res, 0);
      })
      .catch(helpers.handler);
  });

  it('GET /debtors/:uuid/invoice should return an empty list if the debtor does not have any invoices', function () {
    return agent.get('/debtors/:uuid/invoices'.replace(':uuid', emptyDebtorUuid))
      .then(function (res) {
        helpers.api.listed(res, 0);
      })
      .catch(helpers.handler);
  });
});
