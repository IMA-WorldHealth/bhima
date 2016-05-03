var chai = require('chai');
var uuid = require('node-uuid');
var expect = chai.expect;

var helpers = require('./helpers');
helpers.configure(chai);

describe('(/debtors) The /debtors API', function () {
  // Logs in before test suite
  const agent = chai.request.agent(helpers.baseUrl);
  before(helpers.login(agent));

  var debtorKeys = ['uuid', 'group_uuid', 'text'];

  var inspectDebtorGroup;
  var debtorUuid = '3be232f9-a4b9-4af6-984c-5d3f87d5c107';
  var emptyDebtorUuid = 'a11e6b7f-fbbb-432e-ac2a-5312a66dccf4';

  var newDebtor = {
    uuid : uuid.v4(),
    group_uuid : '4de0fe47-177f-4d30-b95f-cff8166400b4',
    text : 'Debtor for Test'
  };


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

  it('GET /debtors should return a list of all debtors', function () {
    return agent.get('/debtors')
      .then(function (res) {
        /** @fixme need use helpers.api.listed but data are provided from other test modules */
        expect(res.body).to.not.be.empty;
        expect(res.body).to.have.length.at.least(1);
      })
      .catch(helpers.handler);
  });

  it('GET /debtors/:uuid should return detail of a specifying debtor', function () {
    return agent.get('/debtors/:uuid'.replace(':uuid', '1fa862d0-2d30-4550-8052-e9aa6dbc467e'))
      .then(function (res) {
        expect(res.body).to.contain.all.keys(debtorKeys);
        expect(res.body.uuid).to.be.equal('1fa862d0-2d30-4550-8052-e9aa6dbc467e');
        expect(res.body.group_uuid).to.be.equal('4de0fe47-177f-4d30-b95f-cff8166400b4');
        expect(res.body.text).to.be.equal('Anonymous/Test Debtor');
      })
      .catch(helpers.handler);
  });

});
