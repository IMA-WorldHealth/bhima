/* global expect, chai, agent */

const helpers = require('./helpers');

/*
 * The /offdays  API endpoint
 *
 * This test suite implements full CRUD on the /offdays  HTTP API endpoint.
 */
describe('(/offdays) The /offdays  API endpoint', function () {

  // Offday we will add during this test suite.

  const offday = {
    label           : 'Hero Lumumba',
    date            : '2017-01-17',
    percent_pay     : 100
  };

  const OFFDAY_KEY = ['id', 'label', 'date', 'percent_pay'];
  const NUM_OFFDAYS = 2;

  it('GET /OFFDAYS returns a list of Offday ', function () {
    return agent.get('/offdays')
    .then(function (res) {
      helpers.api.listed(res, NUM_OFFDAYS);
    })
    .catch(helpers.handler);
  });

  it('POST /OFFDAYS should create a new Offday', function () {
    return agent.post('/offdays')
    .send(offday)
    .then(function (res) {
      offday.id = res.body.id;
      helpers.api.created(res);
    })
    .catch(helpers.handler);
  });

  it('GET /OFFDAYS/:ID should not be found for unknown id', function () {
    return agent.get('/offdays/unknownOffday')
    .then(function (res) {
      helpers.api.errored(res, 404);
    })
    .catch(helpers.handler);
  });

  it('PUT /OFFDAYS  should update an existing Offday ', function () {
    return agent.put('/offdays/' + offday.id)
      .send({ label : 'Offday Updated' })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body.label).to.equal('Offday Updated');
      })
      .catch(helpers.handler);
  });

  it('GET /OFFDAYS/:ID returns a single Offday ', function () {
    return agent.get('/offdays/' + offday.id)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
      })
      .catch(helpers.handler);
  });

  it('DELETE /OFFDAYS/:ID will send back a 404 if the Offday does not exist', function () {
    return agent.delete('/offdays/inknowOffday')
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('DELETE /OFFDAYS/:ID should delete a Offday ', function () {
    return agent.delete('/offdays/' + offday.id)
      .then(function (res) {
        helpers.api.deleted(res);
      })
      .catch(helpers.handler);
  });
});