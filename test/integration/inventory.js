/* global expect, agent */

const helpers = require('./helpers');
const uuid = require('uuid/v4');

describe('(/inventory) The Inventory HTTP API', () => {
  let inventoryList;

  const inventoryGroup = {
    uuid : uuid(),
    code : '99',
    name : 'Test Inventory Group 2',
    stock_account : 162, // 31110010 - 'Medicaments en comprimes *'
    sales_account : 242, // 70111010 - Vente Medicaments en comprimes
    cogs_account : 209, // 60310010 - Médicaments en comprimés
    expires : 1,
    unique_item : 0,
  };

  const updateGroup = {
    code : '111',
    name : 'Updated Inventory Group',
    stock_account : 163, // 31110011 - Medicaments en Sirop *
    sales_account : 242, // 70111010 - Vente Medicaments en comprimes
    cogs_account : 209, // 60310010 - Médicaments en comprimés
    expires : 1,
    unique_item : 0,
  };

  const inventoryType = {
    text : '[Test] Article Laboratoire',
  };

  const updateType = {
    text : '[Test] Article Chirurgie',
  };

  const inventoryUnit = {
    text : '[Test] Comprimés',
    abbr : 'TC',
  };

  const updateUnit = {
    text : '[Test] Gellule',
    abbr : 'TG',
  };

  // ========================== inventory groups ==============================

  // create inventory group
  it('POST /inventory/group create a new inventory group', () => {
    return agent.post('/inventory/groups')
      .send(inventoryGroup)
      .then(res => {
        helpers.api.created(res);
        expect(res.body.uuid).to.be.equal(inventoryGroup.uuid);
      })
      .catch(helpers.handler);
  });

  // update inventory group
  it('PUT /inventory/group/:uuid updates an existing inventory group', () => {
    return agent.put(`/inventory/groups/${inventoryGroup.uuid}`)
      .send(updateGroup)
      .then(res => {
        const group = res.body;
        updateGroup.uuid = inventoryGroup.uuid;
        expect(group).to.contain.all.keys(Object.keys(updateGroup));

        Object.keys(group).forEach(key => {
          expect(group[key]).to.be.equals(updateGroup[key]);
        });
      })
      .catch(helpers.handler);
  });

  // list of inventory groups
  it('GET /inventory/group returns list of inventory groups', () => {
    return agent.get('/inventory/groups')
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
      })
      .catch(helpers.handler);
  });

  // details of inventory groups
  it('GET /inventory/group returns details of an inventory group', () => {
    return agent.get(`/inventory/groups/${inventoryGroup.uuid}`)
      .then(res => {
        const group = res.body;
        expect(group).to.contain.all.keys(Object.keys(inventoryGroup));
        // compare value to the last update of our request
        Object.keys(group).forEach(key => {
          expect(group[key]).to.be.equals(updateGroup[key]);
        });
      })
      .catch(helpers.handler);
  });

  // delete the inventory groups
  it('DELETE /inventroy/groups delete an existing inventory group', () => {
    return agent.delete(`/inventory/groups/${inventoryGroup.id}`)
      .then(res => {
        helpers.api.deleted(res);
      })
      .catch(helpers.handler);
  });

  // ========================== inventory types ===============================

  // create inventory type
  it('POST /inventory/types create a new inventory types', () => {
    return agent.post('/inventory/types')
      .send(inventoryType)
      .then(res => {
        inventoryType.id = res.body.id;
        helpers.api.created(res);
        expect(res.body.id).to.be.equal(inventoryType.id);
      })
      .catch(helpers.handler);
  });

  // update inventory type
  it('PUT /inventory/types/:id updates an existing inventory type', () => {
    return agent.put(`/inventory/types/${inventoryType.id}`)
      .send(updateType)
      .then(res => {
        const type = res.body[0];
        updateType.id = inventoryType.id;
        expect(type).to.contain.all.keys(Object.keys(updateType));
        expect(type).to.be.deep.equals(updateType);
      })
      .catch(helpers.handler);
  });

  // list of inventory type
  it('GET /inventory/types returns list of inventory types', () => {
    return agent.get('/inventory/types')
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
      })
      .catch(helpers.handler);
  });

  // details of inventory types
  it('GET /inventory/types returns details of an inventory type', () => {
    return agent.get(`/inventory/types/${inventoryType.id}`)
      .then(res => {
        const type = res.body[0];
        expect(type).to.contain.all.keys(Object.keys(inventoryType));
        expect(type).to.be.deep.equals(updateType);
        helpers.api.listed(res, 1);
      })
      .catch(helpers.handler);
  });

  // delete the inventory types
  it('DELETE /inventroy/types delete an existing inventory types', () => {
    return agent.delete(`/inventory/types/${inventoryType.id}`)
      .then(res => {
        helpers.api.deleted(res);
      })
      .catch(helpers.handler);
  });

  // ========================== inventory units ===============================

  // create inventory type
  it('POST /inventory/units create a new inventory units', () => {
    return agent.post('/inventory/units')
      .send(inventoryUnit)
      .then(res => {
        inventoryUnit.id = res.body.id;
        helpers.api.created(res);
        expect(res.body.id).to.be.equal(inventoryUnit.id);
      })
      .catch(helpers.handler);
  });

  // update inventory units
  it('PUT /inventory/units/:id updates an existing inventory units', () => {
    return agent.put(`/inventory/units/${inventoryUnit.id}`)
      .send(updateUnit)
      .then(res => {
        const unit = res.body[0];
        updateUnit.id = inventoryUnit.id;
        expect(unit).to.contain.all.keys(Object.keys(updateUnit));
        expect(unit).to.be.deep.equals(updateUnit);
      })
      .catch(helpers.handler);
  });

  // list of inventory units
  it('GET /inventory/units returns list of inventory units', () => {
    return agent.get('/inventory/units')
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
      })
      .catch(helpers.handler);
  });

  // details of inventory units
  it('GET /inventory/units returns details of an inventory unit', () => {
    return agent.get(`/inventory/units/${inventoryUnit.id}`)
      .then(res => {
        const unit = res.body[0];
        expect(unit).to.contain.all.keys(Object.keys(inventoryUnit));
        expect(unit).to.be.deep.equals(updateUnit);
        helpers.api.listed(res, 1);
      })
      .catch(helpers.handler);
  });

  // delete the inventory unit
  it('DELETE /inventory/units delete an existing inventory unit', () => {
    return agent.delete(`/inventory/units/${inventoryUnit.id}`)
      .then(res => {
        helpers.api.deleted(res);
      })
      .catch(helpers.handler);
  });

  // ============================ inventory metadata ===========================

  // inventory list items
  const metadata = {
    uuid : uuid(),
    code : '1000012', // code must be unique
    text : '[IT] Inventory Article',
    price : 5,
    default_quantity : 15,
    group_uuid : inventoryGroup.uuid,
    unit_id : 1,
    type_id : 1,
    consumable : 0,
  };

  const metadataUpdate = {
    code : '1000012', // code must be unique
    text : '[IT] Inventory Article updated',
    default_quantity : 12,
    group_uuid : inventoryGroup.uuid,
    consumable : 0,
  };

  const metadataSearch = {
    text : 'Albendazo', // should find "Albendazole"
  };

  it('POST /inventory/metadata create a new inventory metadata', () => {
    return agent.post('/inventory/metadata')
      .send(metadata)
      .then(res => {
        helpers.api.created(res);
        expect(res.body.uuid).to.be.equal(metadata.uuid);
      })
      .catch(helpers.handler);
  });

  it('PUT /inventory/:uuid/metadata update an existing inventory metadata', () => {
    return agent.put(`/inventory/${metadata.uuid}/metadata`)
      .send(metadataUpdate)
      .then(res => {
        // NOTE: Returned data are from the /inventory/:uuid/metadata API
        // these data are not sent by the test but come from join with other table :
        // label, groupName, type, unit
        expect(res.body.code).to.be.equal(metadataUpdate.code);
        expect(res.body.label).to.be.equal(metadataUpdate.text);
        expect(res.body.default_quantity).to.be.equal(metadataUpdate.default_quantity);
        expect(res.body.group_uuid).to.be.equal(metadataUpdate.group_uuid);
        expect(res.body.consumable).to.be.equal(metadataUpdate.consumable);
      })
      .catch(helpers.handler);
  });

  it('GET /inventory/metadata returns the list of filtered inventories', () => {
    return agent.get('/inventory/metadata')
      .query(metadataSearch)
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        inventoryList = res.body;
        expect(res.body.length).to.be.equal(1);
      })
      .catch(helpers.handler);
  });

  it('GET /inventory/metadata returns the list of inventory metadata', () => {
    return agent.get('/inventory/metadata')
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        inventoryList = res.body;
      })
      .catch(helpers.handler);
  });

  // count inventory in the group
  it('GET /inventory/groups/:uuid/count', () => {
    return agent.get(`/inventory/groups/${inventoryGroup.uuid}/count`)
      .then(res => {
        var countInventory = inventoryList.filter((item) => {
          return item.group_uuid === inventoryGroup.uuid;
        }).length;
        expect(res.body).to.be.equal(countInventory);
      })
      .catch(helpers.handler);
  });
});
