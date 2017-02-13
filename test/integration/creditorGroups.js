/* global expect, chai, agent */

const helpers = require('./helpers');
const uuid = require('node-uuid');

/*
 * The /creditor_groups API endpoint
 *
 * This test suite implements full CRUD on the /creditor_groups HTTP API endpoint.
 */
describe('(/creditor_groups) Creditor Groups', function () {

  // creditor group we will add during this test suite.
  var creditorGroup = {
    enterprise_id : 1,
    uuid          : uuid.v4(),
    name          : 'Creditor Test',
    account_id    : 3629,
    locked        : 0
  };

  var responseKeys = ['enterprise_id', 'uuid', 'name', 'account_id', 'locked'];
  var numCreditorGroups = 2;


  it('GET /creditor_groups returns a list of creditor group', function () {
    return agent.get('/creditor_groups')
    .then(function (res) {
      helpers.api.listed(res, numCreditorGroups);
    })
    .catch(helpers.handler);
  });


  it('POST /creditor_groups  should create a new creditor group', function () {
    return agent.post('/creditor_groups')
    .send(creditorGroup)
    .then(function (res) {
      helpers.api.created(res);
    })
    .catch(helpers.handler);
  });

  it('GET /creditor_groups/:uuid should not be found for unknown uuid', function () {
    return agent.get('/creditor_groups/unknown')
    .then(function (res) {
      helpers.api.errored(res, 404);
    })
    .catch(helpers.handler);
  });

  it('PUT /creditor_groups  should update an existing creditor group', function () {
    return agent.put('/creditor_groups/' + creditorGroup.uuid)
      .send({ name : 'Creditor Group Update' })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.keys(responseKeys);
        expect(res.body.name).to.equal('Creditor Group Update');
      })
      .catch(helpers.handler);
  });

  it('GET /creditor_groups/:uuid returns a single creditor group', function () {
    return agent.get('/creditor_groups/' + creditorGroup.uuid)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.uuid).to.equal(creditorGroup.uuid);
      })
      .catch(helpers.handler);
  });
});
