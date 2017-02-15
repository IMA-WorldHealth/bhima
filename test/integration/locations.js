/* global expect, chai, agent */

'use strict';

const helpers = require('./helpers');
const uuid = require('node-uuid');

const _ = require('lodash');

/*
 * The /locations API endpoint
 */
describe('(/locations) Locations Interface', function () {

  /*
   * number of test villages, sectors, provinces, and countries in the test
   * dataset.
   */
  const numVillages = 2;
  const numSectors  = 2;
  const numProvinces = 2;
  const numCountries = 2;

  /*
   * Selected sector, province, and country uuids to test the query string
   * filtering of the dataset.
   */
  const sectorUuid = '0404e9ea-ebd6-4f20-b1f8-6dc9f9313450'; // Tshikapa
  const provinceUuid = 'f6fc7469-7e58-45cb-b87c-f08af93edade'; // Bas Congo
  const countryUuid = 'dbe330b6-5cde-4830-8c30-dc00eccd1a5f'; // DRC

  /*
   * the filtered record counts associated with the previous filters
   */
  const numFilteredVillages = 1;
  const numFilteredSectors = 1;
  const numFilteredProvinces = 1;

  /* the test enterprise's location uuid */
  const detailUuid = '1f162a10-9f67-4788-9eff-c1fea42fcc9b';

  it('GET /locations/villages should return a list of villages', function () {
    return agent.get('/locations/villages')
      .then(function (res) {

        // check that we received the correct number of villages
        helpers.api.listed(res, numVillages);
      })
      .catch(helpers.handler);
  });

  it('GET /locations/villages?sector={uuid} should return a filtered list of villages', function () {
    return agent.get(`/locations/villages?sector=${sectorUuid}`)
      .then(function (res) {

        // check that we received the correct number of villages
        helpers.api.listed(res, numFilteredVillages);
      })
      .catch(helpers.handler);
  });

  it('GET /locations/sectors should return a list of sectors', function () {
    return agent.get('/locations/sectors')
      .then(function (res) {

        // check that we received the correct number of sectors
        helpers.api.listed(res, numSectors);
      })
      .catch(helpers.handler);
  });

  it('GET /locations/sectors?province={uuid} should return a filtered list of sectors', function () {
    return agent.get(`/locations/sectors?province=${provinceUuid}`)
      .then(function (res) {

        // check that we received the correct number of sectors
        helpers.api.listed(res, numFilteredSectors);
      })
      .catch(helpers.handler);
  });

  it('GET /locations/provinces should return a list of provinces', function () {
    return agent.get('/locations/provinces')
    .then(function (res) {

      // check that we received the correct number of provinces
      helpers.api.listed(res, numProvinces);
    })
    .catch(helpers.handler);
  });

  it('GET /locations/provinces?country={uuid} should return a filtered list of provinces', function () {
    return agent.get(`/locations/provinces?country=${countryUuid}`)
    .then(function (res) {

      // check that we received the correct number of provinces
      helpers.api.listed(res, numFilteredProvinces);
    })
    .catch(helpers.handler);
  });

  it('GET /locations/countries should return a list of countries', function () {
    return agent.get('/locations/countries')
    .then(function (res) {

      // check that we received the correct number of countries
      helpers.api.listed(res, numCountries);
    })
    .catch(helpers.handler);
  });

  it('GET /locations/detail/:uuid should return a JSON description of the location', function () {
    return agent.get('/locations/detail/'.concat(detailUuid))
    .then(function (res) {

      // make sure we successfully found the location
      expect(res).to.have.status(200);
      expect(res).to.be.json;

      expect(res.body).to.have.keys([
        'villageUuid', 'village', 'sector', 'sectorUuid',
        'province', 'provinceUuid', 'country', 'countryUuid'
      ]);
    })
    .catch(helpers.handler);
  });


  it('GET /locations/detail/ Return a Global list of all locations with all information (Country, Province, District and Village) ', function () {
    return agent.get('/locations/detail/')
    .then(function (res) {
      expect(res).to.have.status(200);
      expect(res).to.be.json;
      expect(res.body).to.have.length(numVillages);

      expect(res.body[0]).to.have.keys([
        'villageUuid', 'village', 'sector', 'sectorUuid',
        'province', 'provinceUuid', 'country', 'countryUuid'
      ]);
    })
    .catch(helpers.handler);
  });

  /* CREATE methods */

  const country = {
    uuid : uuid.v4(),
    name : 'Test Country'
  };

  const province = {
    uuid : uuid.v4(),
    name : 'Test Province',
    country_uuid : country.uuid
  };

  const sector = {
    uuid : uuid.v4(),
    name : 'Test Sector',
    province_uuid : province.uuid
  };

  const village = {
    uuid: uuid.v4(),
    name: 'Test Village',
    sector_uuid: sector.uuid
  };

  it('POST /locations/countries should create a country', function () {
    return agent.post('/locations/countries')
      .send(country)
      .then(function (res) {
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  it('POST /locations/provinces should create a province', function () {
    return agent.post('/locations/provinces')
      .send(province)
      .then(function (res) {
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  it('POST /locations/sectors should create a sector', function () {
    return agent.post('/locations/sectors')
      .send(sector)
      .then(function (res) {
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  it('POST /locations/villages should create a village', function () {
    return agent.post('/locations/villages')
      .send(village)
      .then(function (res) {
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  it('POST /locations/villages should not create the same village twice in the same sector', function () {
    return agent.post('/locations/villages')
      .send(village)
      .then(function (res) {
        helpers.api.errored(res, 400);
      })
      .catch(helpers.handler);
  });

  it('POST /locations/villages should create the same village name in a different sector', function () {
    let copy = _.clone(village);
    copy.sector_uuid = sectorUuid;
    copy.uuid = uuid.v4();

    return agent.post('/locations/villages')
      .send(copy)
      .then(function (res) {
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  it('PUT /locations/villages/:uuid should update a Village', function () {

    return agent.put('/locations/villages/' + village.uuid)
      .send({ name : 'Update Village'})
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body.name).to.equal('Update Village');
      })
      .catch(helpers.handler);
  });

  it('PUT /locations/sectors/:uuid should update a Sector', function () {
    return agent.put('/locations/sectors/' + sector.uuid)
      .send({ name : 'Update New Sector'})
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body.name).to.equal('Update New Sector');
      })
      .catch(helpers.handler);
  });

  it('PUT /locations/provinces/:uuid should update a Province', function () {
    return agent.put('/locations/provinces/' + province.uuid)
      .send({ name : 'Update New Province'})
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body.name).to.equal('Update New Province');
      })
      .catch(helpers.handler);
  });

  it('PUT /locations/countries/:uuid should update a Country', function () {
    return agent.put('/locations/countries/' + country.uuid)
      .send({ name : 'Update New Country'})
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body.name).to.equal('Update New Country');
      })
      .catch(helpers.handler);
  });

});
