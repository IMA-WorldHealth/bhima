/* global expect, chai, agent */

const helpers = require('./helpers');

/*
 * The /taxes  API endpoint
 *
 * This test suite implements full CRUD on the /taxes  HTTP API endpoint.
 */
describe('(/taxes) The /taxes  API endpoint', function () {

  // Tax we will add during this test suite.

  const tax = {
    label           : 'Tax Test',
    abbr            : 'TTest',
    is_employee     : 1,
    is_percent      : 1,
    four_account_id : 3638,
    six_account_id  : 3630,
    value           : 3.5,
    is_ipr          : 0  
  };

  const TAX_KEY = ['id', 'label', 'is_employee', 'is_percent', 'four_account_id', 'six_account_id', 'value', 'is_ipr'];
  const NUM_TAXES = 1;

  it('GET /TAXES returns a list of Taxes ', function () {
    return agent.get('/taxes')
    .then(function (res) {
      helpers.api.listed(res, NUM_TAXES);
    })
    .catch(helpers.handler);
  });

  it('POST /TAXES should create a new Tax', function () {
    return agent.post('/taxes')
    .send(tax)
    .then(function (res) {
      tax.id = res.body.id;
      helpers.api.created(res);
    })
    .catch(helpers.handler);
  });

  it('GET /TAXES/:ID should not be found for unknown id', function () {
    return agent.get('/taxes/unknownTax')
    .then(function (res) {
      helpers.api.errored(res, 404);
    })
    .catch(helpers.handler);
  });

  it('PUT /TAXES  should update an existing Tax ', function () {
    return agent.put('/taxes/' + tax.id)
      .send({ label : 'Tax Updated' })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body.label).to.equal('Tax Updated');
      })
      .catch(helpers.handler);
  });

  it('GET /TAXES/:ID returns a single Tax ', function () {
    return agent.get('/taxes/' + tax.id)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
      })
      .catch(helpers.handler);
  });

  it('DELETE /TAXES/:ID will send back a 404 if the Tax does not exist', function () {
    return agent.delete('/taxes/inknowTax')
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('DELETE /TAXES/:ID should delete a Tax ', function () {
    return agent.delete('/taxes/' + tax.id)
      .then(function (res) {
        helpers.api.deleted(res);
      })
      .catch(helpers.handler);
  });
});