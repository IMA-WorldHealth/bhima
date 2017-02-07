/* global expect, chai, agent */
/* jshint expr : true */

const helpers = require('./helpers');
const uuid = require('node-uuid');

/*
 * The /grades API endpoint
 *
 * This test suite implements full CRUD on the /grades   HTTP API endpoint.
 */
describe('(/grades) API endpoint', function () {

  // grade we will add during this test suite.
  var grade = {
    uuid : uuid.v4(),
    code : 'G2',
    text : 'Grade 2',
    basic_salary : 150
  };

  const responseKeys = ['uuid', 'code', 'text', 'basic_salary'];
  const numGrades = 2;


  it('GET /grades returns a list of grade ', function () {
    return agent.get('/grades')
    .then(function (res) {
      helpers.api.listed(res, numGrades);
    })
    .catch(helpers.handler);
  });


  it('POST /grades should create a new grade', function () {
    return agent.post('/grades')
    .send(grade)
    .then(function (res) {
      helpers.api.created(res);
    })
    .catch(helpers.handler);
  });

  it('GET /grades/:uuid should not be found for unknown uuid', function () {
    return agent.get('/grades/unknown')
    .then(function (res) {
      helpers.api.errored(res, 404);
    })
    .catch(helpers.handler);
  });

  it('PUT /grades should update an existing Grade ', function () {
    return agent.put('/grades/' + grade.uuid)
      .send({ basic_salary : 2000 })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.keys(responseKeys);
        expect(res.body.basic_salary).to.equal(2000);
      })
      .catch(helpers.handler);
  });

  it('GET /grades/:uuid returns a single grade ', function () {
    return agent.get('/grades/' + grade.uuid)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
      })
      .catch(helpers.handler);
  });

  it('DELETE /grades/:uuid will send back a 404 if the grade does not exist', function () {
    return agent.delete('/grades/unknown')
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('DELETE /grades/:uuid should delete a grade', function () {
    return agent.delete('/grades/' + grade.uuid)
      .then(function (res) {
        helpers.api.deleted(res);
      })
      .catch(helpers.handler);
  });
});
