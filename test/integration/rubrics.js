/* global expect, chai, agent */

const helpers = require('./helpers');

/*
 * The /rubrics  API endpoint
 *
 * This test suite implements full CRUD on the /rubrics  HTTP API endpoint.
 */
describe('(/rubrics) The /rubrics  API endpoint', function () {

  // Rubric we will add during this test suite.

  const rubric = {
    label           : 'Rubric Test',
    abbr            : 'RTest',
    is_discount     : 1,
    is_percent      : 0,
    is_advance      : 1,
    is_social_care  : 1,
    value           : 40  
  };

  const RUBRIC_KEY = ['id', 'label', 'abbr', 'is_discount', 'is_percent', 'is_advance', 'is_social_care', 'value'];
  const NUM_RUBRICS = 2;

  it('GET /RUBRICS returns a list of function ', function () {
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
    return agent.put('/rubrics/' + rubric.id)
      .send({ label : 'Rubric Updated' })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body.label).to.equal('Rubric Updated');
      })
      .catch(helpers.handler);
  });

  it('GET /RUBRICS/:ID returns a single Rubric ', function () {
    return agent.get('/rubrics/' + rubric.id)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
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
    return agent.delete('/rubrics/' + rubric.id)
      .then(function (res) {
        helpers.api.deleted(res);
      })
      .catch(helpers.handler);
  });
});