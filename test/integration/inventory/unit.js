/* global expect, agent */

const helpers = require('../helpers');
const shared = require('./shared');

describe('(/inventory/units) The inventory units HTTP API', () => {

  const NUM_UNITS = 18;
  it(`GET /inventory/units finds ${NUM_UNITS} inventory units`, () => {
    return agent.get('/inventory/units')
      .then(res => {
        helpers.api.listed(res, NUM_UNITS);
      })
      .catch(helpers.handler);
  });

  // create inventory type
  it('POST /inventory/units creates a new inventory unit', () => {
    return agent.post('/inventory/units')
      .send(shared.inventoryUnit)
      .then(res => {
        shared.inventoryUnit.id = res.body.id;
        helpers.api.created(res);
        expect(res.body.id).to.be.equal(shared.inventoryUnit.id);
      })
      .catch(helpers.handler);
  });

  // update inventory units
  it('PUT /inventory/units/:id updates an existing inventory unit', () => {
    return agent.put(`/inventory/units/${shared.inventoryUnit.id}`)
      .send(shared.updateUnit)
      .then(res => {
        const unit = res.body[0];
        shared.updateUnit.id = shared.inventoryUnit.id;
        expect(unit).to.contain.all.keys(Object.keys(shared.updateUnit));
        expect(unit).to.be.deep.equals(shared.updateUnit);
      })
      .catch(helpers.handler);
  });

  it(`GET /inventory/units finds ${NUM_UNITS + 1} inventory units after creation`, () => {
    return agent.get('/inventory/units')
      .then(res => {
        helpers.api.listed(res, NUM_UNITS + 1);
      })
      .catch(helpers.handler);
  });

  // details of inventory units
  it('GET /inventory/units returns details of an inventory unit', () => {
    return agent.get(`/inventory/units/${shared.inventoryUnit.id}`)
      .then(res => {
        const unit = res.body[0];
        expect(unit).to.contain.all.keys(Object.keys(shared.inventoryUnit));
        expect(unit).to.be.deep.equals(shared.updateUnit);
        helpers.api.listed(res, 1);
      })
      .catch(helpers.handler);
  });

  // delete the inventory unit
  it('DELETE /inventory/units delete an existing inventory unit', () => {
    return agent.delete(`/inventory/units/${shared.inventoryUnit.id}`)
      .then(res => {
        helpers.api.deleted(res);
      })
      .catch(helpers.handler);
  });
});
