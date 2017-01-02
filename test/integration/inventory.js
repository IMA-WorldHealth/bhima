/* global expect, chai, agent */
/* jshint expr : true */
'use strict';

const helpers = require('./helpers');
const uuid    = require('node-uuid');

describe('(/inventory) The Inventory HTTP API', () => {
  let inventoryList;

  let inventoryGroup = {
    uuid : uuid.v4(),
    code : '10',
    name : 'Test Inventory Group 2',
    stock_account : 3635,
    cogs_account  : 3636,
    sales_account : 3637
  };

  let updateGroup = {
    code : '20',
    name : 'Updated Inventory Group',
    stock_account : 3629,
    cogs_account  : 3630,
    sales_account : 3631
  };

  let inventoryType = {
    text : '[Test] Article Laboratoire'
  };

  let updateType = {
    text : '[Test] Article Chirurgie'
  };

  let inventoryUnit = {
    text : '[Test] Comprimés'
  };

  let updateUnit = {
    text : '[Test] Gellule'
  };

  // ========================== inventory groups ==============================

  // create inventory group
  it('POST /inventory/group create a new inventory group', () => {
    return agent.post('/inventory/groups')
      .send(inventoryGroup)
      .then((res) => {
        helpers.api.created(res);
        expect(res.body.uuid).to.be.equal(inventoryGroup.uuid);
      })
      .catch(helpers.handler);
  });

  // update inventory group
  it('PUT /inventory/group/:uuid updates an existing inventory group', () => {
    return agent.put('/inventory/groups/' + inventoryGroup.uuid)
      .send(updateGroup)
      .then((res) => {
        let group = res.body[0];
        updateGroup.uuid = inventoryGroup.uuid;
        expect(group).to.contain.all.keys(Object.keys(updateGroup));
        for (const i in group) {
          if (group.hasOwnProperty(i)) {
            expect(group[i]).to.be.equals(updateGroup[i]);
          }
        }
      })
      .catch(helpers.handler);
  });

  // list of inventory groups
  it('GET /inventory/group returns list of inventory groups', () => {
    return agent.get('/inventory/groups')
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
      })
      .catch(helpers.handler);
  });

  // details of inventory groups
  it('GET /inventory/group returns details of an inventory group', () => {
    return agent.get('/inventory/groups/' + inventoryGroup.uuid)
      .then((res) => {
        let group = res.body[0];
        expect(group).to.contain.all.keys(Object.keys(inventoryGroup));
        // compare value to the last update of our request
        for (const i in group) {
          if (group.hasOwnProperty(i)) {
            expect(group[i]).to.be.equals(updateGroup[i]);
          }
        }
        helpers.api.listed(res, 1);
      })
      .catch(helpers.handler);
  });

  // delete the inventory groups
  it('DELETE /inventroy/groups delete an existing inventory group', () => {
    return agent.delete('/inventory/groups/' + inventoryGroup.id)
      .then((res) => {
        helpers.api.deleted(res);
      })
      .catch(helpers.handler);
  });

  // ========================== inventory types ===============================

  // create inventory type
  it('POST /inventory/types create a new inventory types', () => {
    return agent.post('/inventory/types')
      .send(inventoryType)
      .then((res) => {
        inventoryType.id = res.body.id;
        helpers.api.created(res);
        expect(res.body.id).to.be.equal(inventoryType.id);
      })
      .catch(helpers.handler);
  });

  // update inventory type
  it('PUT /inventory/types/:id updates an existing inventory type', () => {
    return agent.put('/inventory/types/' + inventoryType.id)
      .send(updateType)
      .then((res) => {
        let type = res.body[0];
        updateType.id = inventoryType.id;
        expect(type).to.contain.all.keys(Object.keys(updateType));
        expect(type).to.be.deep.equals(updateType);
      })
      .catch(helpers.handler);
  });

  // list of inventory type
  it('GET /inventory/types returns list of inventory types', () => {
    return agent.get('/inventory/types')
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
      })
      .catch(helpers.handler);
  });

  // details of inventory types
  it('GET /inventory/types returns details of an inventory type', () => {
    return agent.get('/inventory/types/' + inventoryType.id)
      .then((res) => {
        let type = res.body[0];
        expect(type).to.contain.all.keys(Object.keys(inventoryType));
        expect(type).to.be.deep.equals(updateType);
        helpers.api.listed(res, 1);
      })
      .catch(helpers.handler);
  });

  // delete the inventory types
  it('DELETE /inventroy/types delete an existing inventory types', () => {
    return agent.delete('/inventory/types/' + inventoryType.id)
      .then((res) => {
        helpers.api.deleted(res);
      })
      .catch(helpers.handler);
  });

  // ========================== inventory units ===============================

  // create inventory type
  it('POST /inventory/units create a new inventory units', () => {
    return agent.post('/inventory/units')
      .send(inventoryUnit)
      .then((res) => {
        inventoryUnit.id = res.body.id;
        helpers.api.created(res);
        expect(res.body.id).to.be.equal(inventoryUnit.id);
      })
      .catch(helpers.handler);
  });

  // update inventory units
  it('PUT /inventory/units/:id updates an existing inventory units', () => {
    return agent.put('/inventory/units/' + inventoryUnit.id)
      .send(updateUnit)
      .then((res) => {
        let unit = res.body[0];
        updateUnit.id = inventoryUnit.id;
        expect(unit).to.contain.all.keys(Object.keys(updateUnit));
        expect(unit).to.be.deep.equals(updateUnit);
      })
      .catch(helpers.handler);
  });

  // list of inventory units
  it('GET /inventory/units returns list of inventory units', () => {
    return agent.get('/inventory/units')
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
      })
      .catch(helpers.handler);
  });

  // detailS of inventory units
  it('GET /inventory/units returns details of an inventory unit', () => {
    return agent.get('/inventory/units/' + inventoryUnit.id)
      .then((res) => {
        let unit = res.body[0];
        expect(unit).to.contain.all.keys(Object.keys(inventoryUnit));
        expect(unit).to.be.deep.equals(updateUnit);
        helpers.api.listed(res, 1);
      })
      .catch(helpers.handler);
  });

  // delete the inventory unit
  it('DELETE /inventroy/units delete an existing inventory unit', () => {
    return agent.delete('/inventory/units/' + inventoryUnit.id)
      .then((res) => {
        helpers.api.deleted(res);
      })
      .catch(helpers.handler);
  });

  // ============================ inventory metadata ===========================

  // inventory list items
  let metadata = {
    uuid : uuid.v4(),
    code : '1000012', // code must be unique
    text : '[IT] Inventory Article',
    price : 5,
    group_uuid : inventoryGroup.uuid,
    unit_id : 1,
    type_id : 1,
    consumable : 0
  };

  let metadataUpdate = {
    uuid : metadata.uuid,
    code : '1000012', // code must be unique
    text : '[IT] Inventory Article updated',
    price : 10,
    group_uuid : inventoryGroup.uuid,
    unit_id : 1,
    type_id : 1,
    consumable : 0
  };

  it('POST /inventory/metadata create a new inventory metadata', () => {
    return agent.post('/inventory/metadata')
      .send(metadata)
      .then((res) => {
        helpers.api.created(res);
        expect(res.body.uuid).to.be.equal(metadata.uuid);
      })
      .catch(helpers.handler);
  });

  it('PUT /inventory/:uuid/metadata update an existing inventory metadata', () => {
    return agent.put('/inventory/' + metadata.uuid + '/metadata')
      .send(metadataUpdate)
      .then((res) => {
        // NOTE: Returned data are from the /inventory/:uuid/metadata API
        // these data are not sended by the test but come from join with other table :
        // label, groupName, type, unit
        expect(res.body.uuid).to.be.equal(metadataUpdate.uuid);
        expect(res.body.code).to.be.equal(metadataUpdate.code);
        expect(res.body.text).to.be.equal(metadataUpdate.label);
        expect(res.body.price).to.be.equal(metadataUpdate.price);
        expect(res.body.group_uuid).to.be.equal(metadataUpdate.group_uuid);
      })
      .catch(helpers.handler);
  });

  it('GET /inventory/metadata returns the list of inventory metadata', () => {
    return agent.get('/inventory/metadata')
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        inventoryList = res.body;
      })
      .catch(helpers.handler);
  });

  // count inventory in the group
  it('GET /inventory/groups/:uuid/count', () => {
    return agent.get('/inventory/groups/' + inventoryGroup.uuid + '/count')
      .then((res) => {
        var countInventory = inventoryList.filter((item) => {
          return item.group_uuid === inventoryGroup.uuid;
        }).length;
        expect(res.body).to.be.equal(countInventory);
      })
      .catch(helpers.handler);
  });

});
