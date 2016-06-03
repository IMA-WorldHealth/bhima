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

  // totals inventory
  let inventoryCount = 0;

  // inventory list items
  let metadata = {
    uuid : uuid.v4(),
    code : '1000004', // code must be unique
    text : 'Inventory Article for Test',
    price : 5,
    group_uuid : '1410dfe0-b478-11e5-b297-023919d3d5b0',
    unit_id : 1,
    type_id : 1,
    consumable : 0
  };

  let metadataUpdate = {
    uuid : metadata.uuid,
    code : '1000004', // code must be unique
    text : '[Update] Inventory Article for Test',
    price : 10,
    group_uuid : '1410dfe0-b478-11e5-b297-023919d3d5b0',
    unit_id : 1,
    type_id : 1,
    consumable : 0
  };

  it('GET /inventory/metadata returns the list of inventory metadata', () => {
    return agent.get('/inventory/metadata')
      .then((res) => {
        inventoryCount = res.body.length;
      })
      .catch(helpers.handler);
  });

  it('POST /inventory/metadata create a new inventory metadata', () => {
    return agent.post('/inventory/metadata')
      .send(metadata)
      .then((res) => {
        expect(res.body.uuid).to.be.equal(metadata.uuid);
      })
      .catch(helpers.handler);
  });

  it('PUT /inventory/:uuid/metadata create a new inventory metadata', () => {
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

});
