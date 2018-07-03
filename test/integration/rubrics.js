/* global expect, agent */

const helpers = require('./helpers');

/*
 * The /payroll/rubrics  API endpoint
 *
 * This test suite implements full CRUD on the /payroll/rubrics  HTTP API endpoint.
 */
describe('(/payroll/rubrics) The /payroll/rubrics  API endpoint', function () {
  // Rubric we will add during this test suite.

  const rubric = {
    label : 'Rubric Test',
    abbr : 'RTest',
    is_employee : 1,
    is_percent : 1,
    is_discount : 1,
    is_tax : 1,
    debtor_account_id : 175,
    expense_account_id : 249,
    value : 3.5,
  };

  const rubricUpdate = {
    label : 'Rubric Updated',
  };

  const rubricConfig = {
    label : 'Configuration 2013',
  };

  const rubricConfigUpdate = {
    label : 'Configuration 2013 Updated',
  };

  const configRubric = { configuration : [5, 2, 3, 1, 4] };
  const configRubricEmpty = { configuration : [] };

  const NUM_RUBRICS = 12;
  const NUM_CONFIG_RUBRICS = 1;

  it('GET /RUBRICS returns a list of Rubrics ', function () {
    return agent.get('/rubrics')
      .then(function (res) {
        helpers.api.listed(res, NUM_RUBRICS);
      })
      .catch(helpers.handler);
  });

  it('POST /RUBRICS should create a new Rubric', function () {
    return agent.post('/rubrics')
      .send(rubric)
      .then(function (res) {
        rubric.id = res.body.id;
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  it('GET /RUBRICS/:ID should not be found for unknown id', function () {
    return agent.get('/rubrics/unknownRubric')
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('PUT /RUBRICS  should update an existing Rubric ', function () {
    return agent.put('/rubrics/'.concat(rubric.id))
      .send(rubricUpdate)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body.label).to.equal('Rubric Updated');
      })
      .catch(helpers.handler);
  });

  it('GET /RUBRICS/:ID returns a single Rubric ', function () {
    return agent.get('/rubrics/'.concat(rubric.id))
      .then(function (res) {
        expect(res).to.have.status(200);
      })
      .catch(helpers.handler);
  });

  it('DELETE /RUBRICS/:ID will send back a 404 if the Rubric does not exist', function () {
    return agent.delete('/rubrics/inknowRubric')
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('DELETE /RUBRICS/:ID should delete a Rubric ', function () {
    return agent.delete('/rubrics/'.concat(rubric.id))
      .then(function (res) {
        helpers.api.deleted(res);
      })
      .catch(helpers.handler);
  });

  // INTEGRATION TEST FOR RUBRIC CONFIGURATION

  it('GET /RUBRIC_CONFIG returns a list of function ', function () {
    return agent.get('/rubric_config')
      .then(function (res) {
        helpers.api.listed(res, NUM_CONFIG_RUBRICS);
      })
      .catch(helpers.handler);
  });

  it('POST /RUBRIC_CONFIG should create a new Rubric Configuration', function () {
    return agent.post('/rubric_config')
      .send(rubricConfig)
      .then(function (res) {
        rubricConfig.id = res.body.id;
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  it('GET /RUBRIC_CONFIG/:ID should not be found for unknown id', function () {
    return agent.get('/rubric_config/unknownRubric')
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('PUT /RUBRIC_CONFIG should update an existing Rubric Configuration', function () {
    return agent.put('/rubric_config/'.concat(rubricConfig.id))
      .send(rubricConfigUpdate)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body.label).to.equal('Configuration 2013 Updated');
      })
      .catch(helpers.handler);
  });

  it('GET /RUBRIC_CONFIG/:ID returns a single Rubric Configuration', function () {
    return agent.get('/rubric_config/'.concat(rubricConfig.id))
      .then(function (res) {
        expect(res).to.have.status(200);
      })
      .catch(helpers.handler);
  });

  it('DELETE /RUBRIC_CONFIG/:ID will send back a 404 if the Rubric Configuration does not exist', function () {
    return agent.delete('/rubric_config/inknowRubric')
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  // INTEGRATION TEST FOR SETTING RUBRICS IN CONFIGURATION

  it('POST /RUBRIC_CONFIG/:ID/SETTING should Set Rubrics in Configuration', function () {
    return agent.post(`/rubric_config/${rubricConfig.id}/setting`)
      .send(configRubric)
      .then(function (res) {
        expect(res).to.have.status(201);
        return agent.get(`/rubric_config/${rubricConfig.id}/setting`);
      })
      .then(res => {
        helpers.api.listed(res, 5);
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
      })
      .catch(helpers.handler);
  });

  it('POST /RUBRIC_CONFIG/:ID/SETTING Update Rubrucs Configuration', function () {
    return agent.post(`/rubric_config/${rubricConfig.id}/setting`)
      .send(configRubricEmpty)
      .then(function (res) {
        expect(res).to.have.status(201);
        return agent.get(`/rubric_config/${rubricConfig.id}/setting`);
      })
      .then(res => {
        helpers.api.listed(res, 0);
        expect(res).to.have.status(200);
      })
      .catch(helpers.handler);
  });

  it('DELETE /RUBRICS/:ID should delete a Rubric ', function () {
    return agent.delete('/rubric_config/'.concat(rubricConfig.id))
      .then(function (res) {
        helpers.api.deleted(res);
      })
      .catch(helpers.handler);
  });

});
