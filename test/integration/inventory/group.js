/* global expect, agent */

const helpers = require('../helpers');
const shared = require('./shared');

describe('(/inventory/group) The inventory group http API', () => {
  // create inventory group
  it('POST /inventory/group create a new inventory group', () => {
    return agent.post('/inventory/groups')
      .send(shared.inventoryGroup)
      .then(res => {
        helpers.api.created(res);
        expect(res.body.uuid).to.be.equal(shared.inventoryGroup.uuid);
      })
      .catch(helpers.handler);
  });

  // update inventory group
  it('PUT /inventory/group/:uuid updates an existing inventory group', () => {
    return agent.put(`/inventory/groups/${shared.inventoryGroup.uuid}`)
      .send(shared.updateGroup)
      .then(res => {
        const group = res.body;
        shared.updateGroup.uuid = shared.inventoryGroup.uuid;
        expect(group).to.contain.all.keys(Object.keys(shared.updateGroup));

        Object.keys(group).forEach(key => {
          expect(group[key]).to.be.equals(shared.updateGroup[key]);
        });
      })
      .catch(helpers.handler);
  });

  // list of inventory groups
  it('GET /inventory/group returns list of inventory groups', () => {
    return agent.get('/inventory/groups')
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.a('object');
      })
      .catch(helpers.handler);
  });

  // details of inventory groups
  it('GET /inventory/group returns details of an inventory group', () => {
    return agent.get(`/inventory/groups/${shared.inventoryGroup.uuid}`)
      .then(res => {
        const group = res.body;
        expect(group).to.contain.all.keys(Object.keys(shared.inventoryGroup));
        // compare value to the last update of our request
        Object.keys(group).forEach(key => {
          expect(group[key]).to.be.equals(shared.updateGroup[key]);
        });
      })
      .catch(helpers.handler);
  });

  // delete the inventory groups
  it('DELETE /inventroy/groups delete an existing inventory group', () => {
    return agent.delete(`/inventory/groups/${shared.inventoryGroup.id}`)
      .then(res => {
        helpers.api.deleted(res);
      })
      .catch(helpers.handler);
  });
});
