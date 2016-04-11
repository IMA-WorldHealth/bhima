/* jshint expr:true*/
var chai = require('chai');
var expect = chai.expect;
var uuid    = require('node-uuid');

var helpers = require('./helpers');
helpers.configure(chai);

/**
* The /grades API endpoint
*
* This test suite implements full CRUD on the /grades   HTTP API endpoint.
*/
describe('The /grades  API endpoint', function () {
  var agent = chai.request.agent(helpers.baseUrl);

  // Grade we will add during this test suite.
  var grade = {
    uuid : uuid.v4(),
    code : 'G2',
    text : 'Grade 2',
    basic_salary : 150
  };

  var GRADE_KEY = ['uuid', 'code', 'text', 'basic_salary'];

  var NUM_GRADES = 2;

  // login before test suite
  before(helpers.login(agent));

  it('GET /grades returns a list of grade ', function () {
    return agent.get('/grades')
    .then(function (res) {
      helpers.api.listed(res, NUM_GRADES);
    })
    .catch(helpers.handler);
  });


  it('POST /grades  should create a new grade', function () {
    return agent.post('/grades')
    .send(grade)
    .then(function (res) {
      helpers.api.created(res);
    })
    .catch(helpers.handler);
  });

  it('GET /grades/:uuid should not be found for unknown uuid', function () {
    return agent.get('/grades/unknownGrade')
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
        expect(res.body).to.have.keys(GRADE_KEY);
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

  it('DELETE /GRADES/:UUID will send back a 404 if the grade does not exist', function () {
    return agent.delete('/grades/inknowGrade')
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('DELETE /GRADES/:UUID should delete a grade ', function () {
    return agent.delete('/grades/' + grade.uuid)
      .then(function (res) {
        helpers.api.deleted(res);
      })
      .catch(helpers.handler);
  });

});
