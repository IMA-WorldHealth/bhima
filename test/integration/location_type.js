/* global expect, agent */
/* eslint-disable no-unused-expressions */

const helpers = require('./helpers');

/*
 * The /locations/types API endpoint
 *
 * This test suite implements full CRUD on the /locations/types   HTTP API endpoint.
 */
describe('(/locations/types) API endpoint', () => {

  // Location type we will add during this test suite.
  const type = {
    translation_key : 'Location Type Sample',
    color : '#8B4513',
    is_leaves : 1,
    label_name : 'location_type_sample',
  };

  const responseKeys = ['id', 'translation_key', 'fixed', 'color', 'is_leaves', 'label_name'];
  const numLocationTypes = 21;

  it('GET /locations/types returns a list of Location type ', () => {
    return agent.get('/locations/types')
      .then((res) => {
        helpers.api.listed(res, numLocationTypes);
      })
      .catch(helpers.handler);
  });

  it('POST /locations/types should create a new type', () => {
    return agent.post('/locations/types')
      .send(type)
      .then((res) => {
        helpers.api.created(res);
        type.id = res.body.id;
      })
      .catch(helpers.handler);
  });

  it('PUT /locations/types/ should update an existing location type', () => {
    return agent.put(`/locations/types/${type.id}`)
      .send({ color : '#ED7E15', is_leaves : 0 })
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.keys(responseKeys);
        expect(res.body.color).to.equal('#ED7E15');
        expect(res.body.is_leaves).to.equal(0);
      })
      .catch(helpers.handler);
  });

  it('DELETE /locations/types/:id should delete a Location type', () => {
    return agent.delete(`/locations/types/${type.id}`)
      .then((res) => {
        helpers.api.deleted(res);
      })
      .catch(helpers.handler);
  });
});
