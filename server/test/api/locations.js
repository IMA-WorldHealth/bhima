var chai = require('chai');
var expect = chai.expect;

/** import test helpers */
var helpers = require('./helpers');
helpers.configure(chai);

/**
* The /locations API endpoint
*/
describe('(/locations) Locations Interface', function () {

  var agent = chai.request.agent(helpers.baseUrl);

  /** login before each request */
  beforeEach(helpers.login(agent));

  /**
   * number of test villages, sectors, provinces, and countries in the test
   * dataset.
   * @const
   */
  var numVillages = 200;
  var numSectors  = 208;
  var numProvinces = 13;
  var numCountries = 241;

  /**
   * Selected sector, province, and country uuids to test the query string
   * filtering of the dataset.
   * @const
   */
  var sectorUuid = '4c9d1f3d-d5af-47ca-80fd-357c2f1fa807'; // Luebo
  var provinceUuid = '5cf83463-2718-4a65-abdd-f9ad2fe4e195'; // Kasai Occidental
  var countryUuid = 'dbe330b6-5cde-4830-8c30-dc00eccd1a5f'; // DRC

  /**
   * the filtered record counts associated with the previous filters
   * @const
   */
  var numFilteredVillages = 13;
  var numFilteredSectors = 11;
  var numFilteredProvinces = 13;

  /** @const the test enterprise's location uuid */
  var detailUuid = 'a0a8998d-af22-4a73-9071-bd43a23f77e3';

  it('GET /locations/villages should return a list of villages', function () {
    return agent.get('/locations/villages')
    .then(function (res) {

      // check that we received the correct number of villages
      helpers.api.listed(res, numVillages);
    })
    .catch(helpers.handler);
  });

  it('GET /locations/villages?sector={uuid} should return a filtered list of villages', function () {
    return agent.get('/locations/villages?sector='.concat(sectorUuid))
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
    return agent.get('/locations/sectors?province='.concat(provinceUuid))
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
    return agent.get('/locations/provinces?country='.concat(countryUuid))
    .then(function (res) {

      // check that we received the correct number of provinces
      helpers.api.listed(res, numFilteredProvinces);
    })
    .catch(helpers.handler);
  });

  it('GET /locations/countries  should return a list of countries', function () {
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
});
