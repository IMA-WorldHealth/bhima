/* global expect, agent */
/* eslint-disable no-unused-expressions */

const _ = require('lodash');
const helpers = require('./helpers');

/*
 * The /locations API endpoint
 */
describe('(/locations) Locations Interface', () => {
  const locationId = 28; // Id for Gombe

  const mergeCountry = {
    selected : { id : 1, uuid : 'DBE330B65CDE48308C30DC00ECCD1A5F' },
    other : { id : 29, uuid : 'F3E0C18CE8D94C86A0F8991503764C94' },
  };

  const mergeProvince = {
    selected : { id : 26, uuid : 'F6FC74697E5845CBB87CF08AF93EDADE' },
    other : { id : 30, uuid : 'E0CE3D8DF7A74D178190569492E70AA4' },
  };

  const mergeTownShip1 = {
    selected : { id : 33, uuid : '15356573135D4D5D978DB2E013DE950F' },
    other : { id : 34, uuid : '8188E9A25A6F4FCAA69D0911B31E1916' },
  };

  const mergeTown = {
    selected : { id : 31, uuid : 'B7824136E94E49F48446EC9C1308AC01' },
    other : { id : 32, uuid : 'C365E37DA6404CD39C61C95628FCFA30' },
  };

  const mergeTown2 = {
    selected : { id : 27, uuid : '0404E9EAEBD64F20B1F86DC9F9313450' },
    other : { id : 31, uuid : 'B7824136E94E49F48446EC9C1308AC01' },
  };

  const mergeTownship2 = {
    selected : { id : 28, uuid : '1F162A109F6747889EFFC1FEA42FCC9B' },
    other : { id : 33, uuid : '15356573135D4D5D978DB2E013DE950F' },
  };

  it(`GET /locations/root should Returns the locations
    at the highest level in the tree structure, excluding those with the chosen type`, () => {
    return agent.get('/locations/root')
      .query({ allRoot : 'false', excludeType : '1' })
      .then((res) => {
        // Checks that the system returns only one Root location by default
        expect(res.body.rows).to.have.length(2);

        expect(res.body).to.have.keys([
          'rows', 'aggregates', 'locationsDeep', 'deepLevel',
        ]);
      })
      .catch(helpers.handler);
  });

  it(`GET /locations/root should Returns the childs to a parent location`, () => {
    return agent.get('/locations/root')
      .query({ excludeType : '1', parentId : '26' })
      .then((res) => {
        // Checks that the system returns only one Root location by default
        expect(res.body.rows).to.have.length(1);
      })
      .catch(helpers.handler);
  });

  it(`GET /locations/detail Return all locations that are left or without
    children by joining the tree with their parents`, () => {
    return agent.get('/locations/detail/')
      .query({ is_leave : 'true' })
      .then((res) => {

        // Check numbers of locations
        expect(res.body.data).to.have.length(27);

        // Check key for data[0]
        expect(res.body.data[0]).to.have.keys([
          'id',
          'name',
          'parent',
          'location_type_id',
          'translation_key',
          'color',
          'country_id',
          'country_name']);

        // Check key for data[2]
        expect(res.body.data[2]).to.have.keys([
          'id',
          'name',
          'parent',
          'location_type_id',
          'translation_key',
          'color',
          'country_id',
          'country_name',
          'district_id',
          'district_name',
          'province_id',
          'province_name']);
      })
      .catch(helpers.handler);
  });

  /** Merge Locations */
  it('POST /locations/merge/ should Merge country', () => {
    return agent.post('/locations/merge/')
      .send(mergeCountry)
      .then((res) => {
        expect(res).to.have.status(200);
      })
      .catch(helpers.handler);
  });

  it('POST /locations/merge/ should Merge province first', () => {
    return agent.post('/locations/merge/')
      .send(mergeProvince)
      .then((res) => {
        expect(res).to.have.status(200);
      })
      .catch(helpers.handler);
  });

  it('POST /locations/merge/ should Merge Township first', () => {
    return agent.post('/locations/merge/')
      .send(mergeTownShip1)
      .then((res) => {
        expect(res).to.have.status(200);
      })
      .catch(helpers.handler);
  });

  it('POST /locations/merge/ should Merge Town first', () => {
    return agent.post('/locations/merge/')
      .send(mergeTown)
      .then((res) => {
        expect(res).to.have.status(200);
      })
      .catch(helpers.handler);
  });

  it('POST /locations/merge/ should Merge Town second', () => {
    return agent.post('/locations/merge/')
      .send(mergeTown2)
      .then((res) => {
        expect(res).to.have.status(200);
      })
      .catch(helpers.handler);
  });

  it('POST /locations/merge/ should Merge Town second', () => {
    return agent.post('/locations/merge/')
      .send(mergeTown2)
      .then((res) => {
        expect(res).to.have.status(200);
      })
      .catch(helpers.handler);
  });

  it('POST /locations/merge/ should Merge Township second', () => {
    return agent.post('/locations/merge/')
      .send(mergeTownship2)
      .then((res) => {
        expect(res).to.have.status(200);
      })
      .catch(helpers.handler);
  });

  it('GET /locations/:id should return a JSON description of the location', () => {
    return agent.get('/locations/'.concat(locationId))
      .then((res) => {
      // make sure we successfully found the location
        expect(res).to.have.status(200);
        expect(res).to.be.an('object');

        expect(res.body).to.have.keys([
          'id', 'uuid', 'name', 'parent', 'parent_uuid', 'location_type_id',
          'longitude', 'latitude', 'translation_key', 'label_name', 'color',
        ]);
      })
      .catch(helpers.handler);
  });

  /* CREATE methods */
  const clownVillage = 43;

  const country = {
    id : 35,
    uuid : helpers.uuid(),
    name : 'Test Country',
    location_type_id : 6,
  };

  const country2 = {
    id : 36,
    uuid : helpers.uuid(),
    name : 'Another Country',
    location_type_id : 6,
  };

  const province = {
    id : 37,
    uuid : helpers.uuid(),
    parent : country.id,
    parent_uuid : country.uuid,
    name : 'Test Province',
    location_type_id : 12,
  };

  const province2 = {
    id : 38,
    uuid : helpers.uuid(),
    parent : country.id,
    parent_uuid : country.uuid,
    name : 'Another Province',
    location_type_id : 12,
  };

  const sector = {
    id : 39,
    uuid : helpers.uuid(),
    parent : province.id,
    parent_uuid : province.uuid,
    name : 'Test Sector',
    location_type_id : 14,
  };

  const sector2 = {
    id : 40,
    uuid : helpers.uuid(),
    parent : province.id,
    parent_uuid : province.uuid,
    name : 'Another Sector',
    location_type_id : 14,
  };

  const village = {
    id : 41,
    uuid : helpers.uuid(),
    name : 'Test Village',
    parent : sector.id,
    parent_uuid : sector.uuid,
    location_type_id : 20,
  };

  const village2 = {
    id : 42,
    uuid : helpers.uuid(),
    name : 'Another Village',
    parent : sector.id,
    parent_uuid : sector.uuid,
    location_type_id : 20,
  };

  it('POST /locations (countries) should create a country', () => {
    return agent.post('/locations')
      .send(country)
      .then((res) => {
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  it('POST /locations (countries) should create another country', () => {
    return agent.post('/locations')
      .send(country2)
      .then((res) => {
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  it('POST /locations (provinces) should create a province', () => {
    return agent.post('/locations')
      .send(province)
      .then((res) => {
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  it('POST /locations (provinces) should create another province', () => {
    return agent.post('/locations')
      .send(province2)
      .then((res) => {
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  it('POST /locations (sectors) should create a sector', () => {
    return agent.post('/locations')
      .send(sector)
      .then((res) => {
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  it('POST /locations (sectors) should create another sector', () => {
    return agent.post('/locations')
      .send(sector2)
      .then((res) => {
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  it('POST /locations (villages) should create a village', () => {
    return agent.post('/locations')
      .send(village)
      .then((res) => {
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  it('POST /locations (villages) should create another village', () => {
    return agent.post('/locations')
      .send(village2)
      .then((res) => {
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  it('POST /locations (villages) should not create the same village twice in the same sector', () => {
    return agent.post('/locations')
      .send(village)
      .then((res) => {
        helpers.api.errored(res, 400);
      })
      .catch(helpers.handler);
  });

  it('POST /locations (villages) should create the same village name in a different sector', () => {
    const copy = _.clone(village);
    copy.id = clownVillage;
    copy.parent = sector2.id;
    copy.parent_uuid = sector2.uuid;
    copy.uuid = helpers.uuid();

    return agent.post('/locations')
      .send(copy)
      .then((res) => {
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  it('PUT /locations/:id (villages) should update a Village', () => {
    return agent.put(`/locations/${village.id}`)
      .send({ name : 'Update Village' })
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body.name).to.equal('Update Village');
      })
      .catch(helpers.handler);
  });

  it('PUT /locations/:id (sectors) should update a Sector', () => {
    return agent.put(`/locations/${sector.id}`)
      .send({ name : 'Update New Sector' })
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body.name).to.equal('Update New Sector');
      })
      .catch(helpers.handler);
  });

  it('PUT /locations/:id (provinces) should update a Province', () => {
    return agent.put(`/locations/${province.id}`)
      .send({ name : 'Update New Province' })
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body.name).to.equal('Update New Province');
      })
      .catch(helpers.handler);
  });

  it('PUT /locations/:id (countries) Cannot delete parent', () => {
    return agent.put(`/locations/${country.id}`)
      .send({ name : 'Update New Country' })
      .then((res) => {
        expect(res).to.have.status(200);
      })
      .catch(helpers.handler);
  });

  it('PUT /locations/:id (countries) should update a Country', () => {
    return agent.put(`/locations/${country.id}`)
      .send({ name : 'Update New Country' })
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body.name).to.equal('Update New Country');
      })
      .catch(helpers.handler);
  });

  it('DELETE /locations/:id (villages) should delete a Village', () => {
    return agent.delete(`/locations/${village2.id}`)
      .then((res) => {
        expect(res).to.have.status(204);
      })
      .catch(helpers.handler);
  });

  it('DELETE /locations/:id (villages) should delete a clownVillage', () => {
    return agent.delete(`/locations/${clownVillage}`)
      .then((res) => {
        expect(res).to.have.status(204);
      })
      .catch(helpers.handler);
  });

  it('DELETE /locations/:id (sectors) should delete a sector', () => {
    return agent.delete(`/locations/${sector2.id}`)
      .then((res) => {
        expect(res).to.have.status(204);
      })
      .catch(helpers.handler);
  });

  it('DELETE /locations/:id (provinces) should delete a province', () => {
    return agent.delete(`/locations/${province2.id}`)
      .then((res) => {
        expect(res).to.have.status(204);
      })
      .catch(helpers.handler);
  });

  it('DELETE /locations/:id (countries) should delete a Country', () => {
    return agent.delete(`/locations/${country2.id}`)
      .then((res) => {
        expect(res).to.have.status(204);
      })
      .catch(helpers.handler);
  });
});
