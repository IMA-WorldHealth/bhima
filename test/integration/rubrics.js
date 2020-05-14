/* global expect, agent */
/* eslint-disable no-unused-expressions */

const helpers = require('./helpers');

/*
 * The /payroll/rubrics  API endpoint
 *
 * This test suite implements full CRUD on the /payroll/rubrics  HTTP API endpoint.
 */
describe('(/payroll/rubrics) The /payroll/rubrics  API endpoint', () => {
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

  const NUM_RUBRICS = 24;
  const NUM_CONFIG_RUBRICS = 2;

  it('GET /RUBRICS returns a list of Rubrics ', () => {
    return agent.get('/rubrics')
      .then((res) => {
        helpers.api.listed(res, NUM_RUBRICS);
      })
      .catch(helpers.handler);
  });

  it('POST /RUBRICS should create a new Rubric', () => {
    return agent.post('/rubrics')
      .send(rubric)
      .then((res) => {
        rubric.id = res.body.id;
        expect(res).to.have.status(201);
      })
      .catch(helpers.handler);
  });

  it('GET /RUBRICS/:ID send back a 404 if the rubrics id does not exist', () => {
    return agent.get('/rubrics/123456789')
      .then((res) => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('GET /RUBRICS/:ID send back a 404 if the rubrics id is a string', () => {
    return agent.get('/rubrics/str')
      .then((res) => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('PUT /RUBRICS  should update an existing Rubric ', () => {
    return agent.put('/rubrics/'.concat(rubric.id))
      .send(rubricUpdate)
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body.label).to.equal('Rubric Updated');
      })
      .catch(helpers.handler);
  });

  it('GET /RUBRICS/:ID returns a single Rubric ', () => {
    return agent.get('/rubrics/'.concat(rubric.id))
      .then((res) => {
        expect(res).to.have.status(200);
      })
      .catch(helpers.handler);
  });

  it('DELETE /RUBRICS/:ID will send back a 404 if the Rubric id does not exist', () => {
    return agent.delete('/rubrics/123456789')
      .then((res) => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('DELETE /RUBRICS/:ID will send back a 404 if the Rubric id is a string', () => {
    return agent.delete('/rubrics/str')
      .then((res) => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('DELETE /RUBRICS/:ID should delete a Rubric ', () => {
    return agent.delete('/rubrics/'.concat(rubric.id))
      .then((res) => {
        helpers.api.deleted(res);
      })
      .catch(helpers.handler);
  });

  // INTEGRATION TEST FOR RUBRIC CONFIGURATION

  it('GET /RUBRIC_CONFIG returns a list of function ', () => {
    return agent.get('/rubric_config')
      .then((res) => {
        helpers.api.listed(res, NUM_CONFIG_RUBRICS);
      })
      .catch(helpers.handler);
  });

  it('POST /RUBRIC_CONFIG should create a new Rubric Configuration', () => {
    return agent.post('/rubric_config')
      .send(rubricConfig)
      .then((res) => {
        rubricConfig.id = res.body.id;
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  it('GET /RUBRIC_CONFIG/:ID will send back a 404 if the Rubric Configuration id does not exist', () => {
    return agent.get('/rubric_config/123456789')
      .then((res) => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('GET /RUBRIC_CONFIG/:ID will send back a 404 if the Rubric Configuration id is a string', () => {
    return agent.get('/rubric_config/str')
      .then((res) => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('PUT /RUBRIC_CONFIG should update an existing Rubric Configuration', () => {
    return agent.put('/rubric_config/'.concat(rubricConfig.id))
      .send(rubricConfigUpdate)
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body.label).to.equal('Configuration 2013 Updated');
      })
      .catch(helpers.handler);
  });

  it('GET /RUBRIC_CONFIG/:ID returns a single Rubric Configuration', () => {
    return agent.get('/rubric_config/'.concat(rubricConfig.id))
      .then((res) => {
        expect(res).to.have.status(200);
      })
      .catch(helpers.handler);
  });

  it('DELETE /RUBRIC_CONFIG/:ID will send back a 404 if the Rubric Configuration id does not exist', () => {
    return agent.delete('/rubric_config/123456789')
      .then((res) => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('DELETE /RUBRIC_CONFIG/:ID will send back a 404 if the Rubric Configuration id is a string', () => {
    return agent.delete('/rubric_config/str')
      .then((res) => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  // INTEGRATION TEST FOR SETTING RUBRICS IN CONFIGURATION

  it('POST /RUBRIC_CONFIG/:ID/SETTING should Set Rubrics in Configuration', () => {
    return agent.post(`/rubric_config/${rubricConfig.id}/setting`)
      .send(configRubric)
      .then((res) => {
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

  it('POST /RUBRIC_CONFIG/:ID/SETTING Update Rubrucs Configuration', () => {
    return agent.post(`/rubric_config/${rubricConfig.id}/setting`)
      .send(configRubricEmpty)
      .then((res) => {
        expect(res).to.have.status(201);
        return agent.get(`/rubric_config/${rubricConfig.id}/setting`);
      })
      .then(res => {
        helpers.api.listed(res, 0);
        expect(res).to.have.status(200);
      })
      .catch(helpers.handler);
  });

  it('DELETE /RUBRICS/:ID should delete a Rubric ', () => {
    return agent.delete('/rubric_config/'.concat(rubricConfig.id))
      .then((res) => {
        helpers.api.deleted(res);
      })
      .catch(helpers.handler);
  });
});
