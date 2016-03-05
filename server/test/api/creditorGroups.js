var chai = require('chai');
var expect = chai.expect;
var uuid    = require('node-uuid');

var helpers = require('./helpers');
helpers.configure(chai);

/**
* The /creditor_groups   API endpoint
*
* This test suite implements full CRUD on the /creditor_groups   HTTP API endpoint.
*/
describe('The /creditor_groups  API endpoint', function () {
  var agent = chai.request.agent(helpers.baseUrl);

  // Creditor group we will add during this test suite.
  var creditorGroup = {
    enterprise_id : 1,
    uuid          : uuid.v4(),
    name          : 'Creditor Test',
    account_id    : 3629,
    locked        : 0
  };
 
  var CREDITOR_GROUP_KEY = ['enterprise_id', 'uuid', 'name', 'account_id', 'locked'];

  var NUM_CREDITOR_GROUPS = 2;

  // login before each request
  before(helpers.login(agent));


  it('GET /CREDITOR_GROUPS  returns a list of Creditor Group ', function () {
    return agent.get('/creditor_groups')
    .then(function (res) {
      helpers.api.listed(res, NUM_CREDITOR_GROUPS);
    })
    .catch(helpers.handler);
  });


  it('POST /CREDITOR_GROUPS  should create a new Creditor Group ', function () {
    return agent.post('/creditor_groups')
    .send(creditorGroup)
    .then(function (res) {
      helpers.api.created(res);
    })
    .catch(helpers.handler);
  });

  it('GET /CREDITOR_GROUPS/:UUID should not be found for unknown uuid', function () {
    return agent.get('/creditor_groups/unknownCreditorGroups')
    .then(function (res) {
      helpers.api.errored(res, 404);
    })
    .catch(helpers.handler);
  });

  it('PUT /CREDITOR_GROUPS  should update an existing Creditor Group ', function () {
    return agent.put('/creditor_groups/' + creditorGroup.uuid)
      .send({ name : 'Creditor Group Update' })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.keys(CREDITOR_GROUP_KEY);
        expect(res.body.name).to.equal('Creditor Group Update');
      })
      .catch(helpers.handler);
  });

  it('GET /CREDITOR_GROUPS/:UUID returns a single Creditor Group ', function () {
    return agent.get('/creditor_groups/' + creditorGroup.uuid)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.uuid).to.equal(creditorGroup.uuid);
      })
      .catch(helpers.handler);
  });

});
