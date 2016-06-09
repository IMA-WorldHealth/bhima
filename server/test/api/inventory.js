/* jshint expr: true */
'use strict';

const chai = require('chai');
const expect = chai.expect;

const helpers = require('./helpers');
const uuid    = require('node-uuid');
helpers.configure(chai);

describe('(/inventory) The inventory HTTP API :: ', function () {

  // Logs in before each test
  const agent = chai.request.agent(helpers.baseUrl);
  before(helpers.login(agent));

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

  it('GET /inventory/metadata returns the list of inventory metadata', function () {
    return agent.get('/inventory/metadata')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
      })
      .catch(helpers.handler);
  });

  it('POST /inventory/metadata create a new inventory metadata', function () {
    return agent.post('/inventory/metadata')
      .send(metadata)
      .then(function (res) {
        helpers.api.created(res);
        expect(res.body.uuid).to.be.equal(metadata.uuid);
      })
      .catch(helpers.handler);
  });

  it('PUT /inventory/:uuid/metadata update an existing inventory metadata', function () {
    return agent.put('/inventory/' + metadata.uuid + '/metadata')
      .send(metadataUpdate)
      .then(function (res) {
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

  // ========================== inventory groups ==============================

  // create inventory group
  it('POST /inventory/group create a new inventory group', function () {
    return agent.post('/inventory/groups')
      .send(inventoryGroup)
      .then(function (res) {
        helpers.api.created(res);
        expect(res.body.uuid).to.be.equal(inventoryGroup.uuid);
      })
      .catch(helpers.handler);
  });

  // update inventory group
  it('PUT /inventory/group/:uuid updates an existing inventory group', function () {
    return agent.put('/inventory/groups/' + inventoryGroup.uuid)
      .send(updateGroup)
      .then(function (res) {
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
  it('GET /inventory/group returns list of inventory groups', function () {
    return agent.get('/inventory/groups')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
      })
      .catch(helpers.handler);
  });

  // detailS of inventory groups
  it('GET /inventory/group returns details of an inventory group', function () {
    return agent.get('/inventory/groups/' + inventoryGroup.uuid)
      .then(function (res) {
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

  // delete the inventory groups
  it('DELETE /inventroy/groups delete an existing inventory group', function () {
    return agent.delete('/inventory/groups/' + inventoryGroup.id)
      .then(function (res) {
        helpers.api.deleted(res);
      })
      .catch(helpers.handler);
  });

  // ========================== inventory types ===============================

  // create inventory type
  it('POST /inventory/types create a new inventory types', function () {
    return agent.post('/inventory/types')
      .send(inventoryType)
      .then(function (res) {
        inventoryType.id = res.body.id;
        helpers.api.created(res);
        expect(res.body.id).to.be.equal(inventoryType.id);
      })
      .catch(helpers.handler);
  });

  // update inventory type
  it('PUT /inventory/types/:id updates an existing inventory type', function () {
    return agent.put('/inventory/types/' + inventoryType.id)
      .send(updateType)
      .then(function (res) {
        let type = res.body[0];
        updateType.id = inventoryType.id;
        expect(type).to.contain.all.keys(Object.keys(updateType));
        expect(type).to.be.deep.equals(updateType);
      })
      .catch(helpers.handler);
  });

  // list of inventory type
  it('GET /inventory/types returns list of inventory types', function () {
    return agent.get('/inventory/types')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
      })
      .catch(helpers.handler);
  });

  // detailS of inventory types
  it('GET /inventory/types returns details of an inventory type', function () {
    return agent.get('/inventory/types/' + inventoryType.id)
      .then(function (res) {
        let type = res.body[0];
        expect(type).to.contain.all.keys(Object.keys(inventoryType));
        expect(type).to.be.deep.equals(updateType);
        helpers.api.listed(res, 1);
      })
      .catch(helpers.handler);
  });

  // delete the inventory types
  it('DELETE /inventroy/types delete an existing inventory types', function () {
    return agent.delete('/inventory/types/' + inventoryType.id)
      .then(function (res) {
        helpers.api.deleted(res);
      })
      .catch(helpers.handler);
  });

  // ========================== inventory units ===============================

  // create inventory type
  it('POST /inventory/units create a new inventory units', function () {
    return agent.post('/inventory/units')
      .send(inventoryUnit)
      .then(function (res) {
        inventoryUnit.id = res.body.id;
        helpers.api.created(res);
        expect(res.body.id).to.be.equal(inventoryUnit.id);
      })
      .catch(helpers.handler);
  });

  // update inventory units
  it('PUT /inventory/units/:id updates an existing inventory units', function () {
    return agent.put('/inventory/units/' + inventoryUnit.id)
      .send(updateUnit)
      .then(function (res) {
        let unit = res.body[0];
        updateUnit.id = inventoryUnit.id;
        expect(unit).to.contain.all.keys(Object.keys(updateUnit));
        expect(unit).to.be.deep.equals(updateUnit);
      })
      .catch(helpers.handler);
  });

  // list of inventory units
  it('GET /inventory/units returns list of inventory units', function () {
    return agent.get('/inventory/units')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
      })
      .catch(helpers.handler);
  });

  // detailS of inventory units
  it('GET /inventory/units returns details of an inventory unit', function () {
    return agent.get('/inventory/units/' + inventoryUnit.id)
      .then(function (res) {
        let unit = res.body[0];
        expect(unit).to.contain.all.keys(Object.keys(inventoryUnit));
        expect(unit).to.be.deep.equals(updateUnit);
        helpers.api.listed(res, 1);
      })
      .catch(helpers.handler);
  });

  // delete the inventory unit
  it('DELETE /inventroy/units delete an existing inventory unit', function () {
    return agent.delete('/inventory/units/' + inventoryUnit.id)
      .then(function (res) {
        helpers.api.deleted(res);
      })
      .catch(helpers.handler);
  });

});
