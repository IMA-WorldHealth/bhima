/* global expect, agent */

const helpers = require('../helpers');
const shared = require('./shared');

describe('(/inventory/units) The inventory units http API', () => {
  // create inventory type
  it('POST /inventory/units create a new inventory units', () => {
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
  it('PUT /inventory/units/:id updates an existing inventory units', () => {
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

  // list of inventory units
  it('GET /inventory/units returns list of inventory units', () => {
    return agent.get('/inventory/units')
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.a('object');
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
