/* global expect, chai, agent */

const helpers = require('./helpers');

/*
 * The /cotisations  API endpoint
 *
 * This test suite implements full CRUD on the /cotisations  HTTP API endpoint.
 */
describe('(/cotisations) The /cotisations  API endpoint', function () {

  // Cotisation we will add during this test suite.

  const cotisation = {
    label           : 'Cotisation Test',
    abbr            : 'CTest',
    is_employee     : 1,
    is_percent      : 1,
    four_account_id : 3638,
    six_account_id  : 3630,
    value           : 3.5  
  };

  const COTISATION_KEY = ['id', 'label', 'is_employee', 'is_percent', 'four_account_id', 'six_account_id', 'value'];
  const NUM_COTISATIONS = 2;

  it('GET /COTISATIONS returns a list of function ', function () {
    return agent.get('/cotisations')
    .then(function (res) {
      helpers.api.listed(res, NUM_COTISATIONS);
    })
    .catch(helpers.handler);
  });

  it('POST /COTISATIONS should create a new Cotisation', function () {
    return agent.post('/cotisations')
    .send(cotisation)
    .then(function (res) {
      cotisation.id = res.body.id;
      helpers.api.created(res);
    })
    .catch(helpers.handler);
  });

  it('GET /COTISATIONS/:ID should not be found for unknown id', function () {
    return agent.get('/cotisations/unknownCotisation')
    .then(function (res) {
      helpers.api.errored(res, 404);
    })
    .catch(helpers.handler);
  });

  it('PUT /COTISATIONS  should update an existing Cotisation ', function () {
    return agent.put('/cotisations/' + cotisation.id)
      .send({ label : 'Cotisation Updated' })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body.label).to.equal('Cotisation Updated');
      })
      .catch(helpers.handler);
  });

  it('GET /COTISATIONS/:ID returns a single Cotisation ', function () {
    return agent.get('/cotisations/' + cotisation.id)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
      })
      .catch(helpers.handler);
  });

  it('DELETE /COTISATIONS/:ID will send back a 404 if the Cotisation does not exist', function () {
    return agent.delete('/cotisations/inknowCotisation')
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('DELETE /COTISATIONS/:ID should delete a Cotisation ', function () {
    return agent.delete('/cotisations/' + cotisation.id)
      .then(function (res) {
        helpers.api.deleted(res);
      })
      .catch(helpers.handler);
  });
});
