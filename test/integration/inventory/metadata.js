/* global expect, agent */

const helpers = require('../helpers');
const shared = require('./shared');

describe('(/inventory/metadata) The inventory metadata http API', () => {
  let inventoryList;

  // inventory list items
  const metadata = {
    code : '1000012', // code must be unique
    text : '[IT] Inventory Article',
    price : 5,
    default_quantity : 15,
    group_uuid : shared.inventoryGroup.uuid,
    unit_id : 1,
    type_id : 1,
    consumable : 0,
    sellable : 1,
  };

  const metadataUpdate = {
    code : '1000012', // code must be unique
    text : '[IT] Inventory Article updated',
    default_quantity : 12,
    group_uuid : shared.inventoryGroup.uuid,
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
        metadata.uuid = res.body.uuid;
      })
      .catch(helpers.handler);
  });

  it('PUT /inventory/metadata/:uuid update an existing inventory metadata', () => {
    return agent.put(`/inventory/metadata/${metadata.uuid}`)
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
        expect(res).to.be.a('object');
        inventoryList = res.body;
        expect(res.body.length).to.be.equal(1);
      })
      .catch(helpers.handler);
  });

  it('GET /inventory/metadata returns the list of inventory metadata', () => {
    return agent.get('/inventory/metadata')
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.a('object');
        inventoryList = res.body;
      })
      .catch(helpers.handler);
  });

  it('GET /inventory/metadata?sellable=1 returns the list of sellable inventories', () => {
    return agent.get('/inventory/metadata?sellable=1')
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.length).to.be.equal(160);
      })
      .catch(helpers.handler);
  });

  it('GET /inventory/metadata?sellable=0 returns the list of unsellable inventories', () => {
    return agent.get('/inventory/metadata?sellable=0')
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.length).to.be.equal(4);
      })
      .catch(helpers.handler);
  });

  // count inventory in the group
  it('GET /inventory/groups/:uuid/count', () => {
    return agent.get(`/inventory/groups/${shared.inventoryGroup.uuid}/count`)
      .then(res => {
        const countInventory = inventoryList.filter((item) => {
          return item.group_uuid === shared.inventoryGroup.uuid;
        }).length;
        expect(res.body).to.be.equal(countInventory);
      })
      .catch(helpers.handler);
  });
});
