/* jshint expr: true */
const chai = require('chai');
const expect = chai.expect;

const helpers = require('./helpers');
const uuid    = require('node-uuid');
helpers.configure(chai);

describe('(/inventory) The inventory HTTP API', function () {

  // Logs in before each test
  const agent = chai.request.agent(helpers.baseUrl);
  before(helpers.login(agent));

  // default number of inventory groups
  let countInventoryGroups = 0;

  // inventory list items
  let metadata = {
    uuid : uuid.v4(),
    code : '1000007', // code must be unique
    text : 'Inventory Article for Test',
    price : 5,
    group_uuid : '1410dfe0-b478-11e5-b297-023919d3d5b0',
    unit_id : 1,
    type_id : 1,
    consumable : 0
  };

  let metadataUpdate = {
    uuid : metadata.uuid,
    code : '1000007', // code must be unique
    text : '[Update] Inventory Article for Test',
    price : 10,
    group_uuid : '1410dfe0-b478-11e5-b297-023919d3d5b0',
    unit_id : 1,
    type_id : 1,
    consumable : 0
  };

  let inventoryGroup = {
    uuid : uuid.v4(),
    code : '10',
    name : 'Test Inventory Group',
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

  it('GET /inventory/metadata returns the list of inventory metadata', () => {
    return agent.get('/inventory/metadata')
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
      })
      .catch(helpers.handler);
  });

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
        // label, groupNmae, type, unit
        expect(res.body[0].uuid).to.be.equal(metadataUpdate.uuid);
        expect(res.body[0].code).to.be.equal(metadataUpdate.code);
        expect(res.body[0].text).to.be.equal(metadataUpdate.label);
        expect(res.body[0].price).to.be.equal(metadataUpdate.price);
      })
      .catch(helpers.handler);
  });

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
        for(var i in group) {
          expect(group[i]).to.be.equals(updateGroup[i]);
        }
      })
      .catch(helpers.handler);
  });

  // list of inventory groups
  it('GET /inventory/group returns list of inventory groups', () => {
    return agent.get('/inventory/groups')
      .then((res) => {
        countInventoryGroups = res.body.length;
        helpers.api.listed(res, countInventoryGroups);
      })
      .catch(helpers.handler);
  });

  // detailS of inventory groups
  it('GET /inventory/group returns details of an inventory group', () => {
    return agent.get('/inventory/groups/' + inventoryGroup.uuid)
      .then((res) => {
        let group = res.body[0];
        expect(group).to.contain.all.keys(Object.keys(inventoryGroup));
        // compare value to the last update of our request
        for(var i in group) {
          expect(group[i]).to.be.equals(updateGroup[i]);
        }
        helpers.api.listed(res, 1);
      })
      .catch(helpers.handler);
  });

});
