/* global expect, agent */

const helpers = require('./helpers');
const uuid = require('uuid/v4');

/*
 * The /creditors/groups API endpoint
 *
 * This test suite implements full CRUD on the /creditors/groups HTTP API endpoint.
 */
describe('(/creditors/groups) Creditor Groups', () => {
  // creditor group we will add during this test suite.
  const creditorGroup = {
    enterprise_id : 1,
    uuid          : uuid(),
    name          : 'Creditor Test',
    account_id    : 284, // 40111000 - SNEL SUPPLIER
    locked        : 0,
  };

  const responseKeys = ['enterprise_id', 'uuid', 'name', 'account_id', 'locked'];
  const numCreditorGroups = 3;

  it('GET /creditors/groups returns a list of creditor group', () => {
    return agent.get('/creditors/groups')
      .then(res => {
        helpers.api.listed(res, numCreditorGroups);
      })
      .catch(helpers.handler);
  });


  it('POST /creditors/groups  should create a new creditor group', () => {
    return agent.post('/creditors/groups')
      .send(creditorGroup)
      .then(res => {
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  it('GET /creditors/groups/:uuid should not be found for unknown uuid', () => {
    return agent.get('/creditors/groups/unknown')
      .then(res => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('PUT /creditors/groups  should update an existing creditor group', () => {
    return agent.put(`/creditors/groups/${creditorGroup.uuid}`)
      .send({ name : 'Creditor Group Update' })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.keys(responseKeys);
        expect(res.body.name).to.equal('Creditor Group Update');
      })
      .catch(helpers.handler);
  });

  it('GET /creditors/groups/:uuid returns a single creditor group', () => {
    return agent.get(`/creditors/groups/${creditorGroup.uuid}`)
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.uuid).to.equal(creditorGroup.uuid);
      })
      .catch(helpers.handler);
  });
});
