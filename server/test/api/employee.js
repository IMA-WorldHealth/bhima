/*global describe, it, beforeEach, process*/

// import testing framework
var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;
chai.use(chaiHttp);

// workaround for low node versions
if (!global.Promise) {
  var q = require('q');
  chai.request.addPromises(q.Promise);
}

// do not throw self-signed certificate errors
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

// base URL
var url = 'https://localhost:8080';

// throw errors
function handler(err) { throw err; }

/**
* The /projects API endpoint
*
* This test suite implements full CRUD on the /projects HTTP API endpoint.
*/
describe('The /employees API endpoint :: ', function () {
  var agent = chai.request.agent(url);

  // employee we will add during this test suite.
  var employee = {
      code : 'x500',
      prenom : 'Carolus',
      name : 'Magnus',
      postnom : 'Charlemagne',
      sexe : 'M',
      dob : '1996-01-01',
      date_embauche : '2016-01-01',
      nb_spouse : 0,
      nb_enfant : 0,
      grade_id : '9ee06e4a-7b59-48e6-812c-c0f8a00cf7d3',
      daily_salary : 50,
      bank : 'BIAC',
      bank_account : '00-99-88-77',
      email : 'me@info.com',
      fonction_id : 1,
      service_id : 1,
      location_id : 'ffe563ef-781c-4551-a080-7cec135351ff',
      creditor_uuid : '42d3756a-7770-4bb8-a899-7953cd859892',
      debitor_uuid : 'be0096dd-2929-41d2-912e-fb2259356fb5'
  };

  var updateEmployee = {
      code : 'x500',
      prenom : 'Charle',
      name : 'Magne',
      postnom : 'De France',
      sexe : 'M',
      dob : '1996-01-01',
      date_embauche : '2016-01-01',
      nb_spouse : 0,
      nb_enfant : 0,
      grade_id : '9ee06e4a-7b59-48e6-812c-c0f8a00cf7d3',
      daily_salary : 50,
      bank : 'BIAC',
      bank_account : '00-99-88-77',
      email : 'me@info.com',
      fonction_id : 1,
      service_id : 1,
      location_id : 'ffe563ef-781c-4551-a080-7cec135351ff'
  };

  // login before each request
  beforeEach(function () {
    var user = { username : 'superuser', password : 'superuser', project: 1};
    return agent
      .post('/login')
      .send(user);
  });

  it('POST /employee should create a new employee', function () {
    return agent.post('/employees')
      .send(employee)
      .then(function (res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body.id).to.be.exist;
        employee.id = res.body.id;
      })
      .catch(handler);
  });

  it('POST /employee with fake employee data', function () {
    return agent.post('/employees')
      .send({})
      .then(function (res) {
        expect(res).to.not.have.status(201);
        expect(res).to.be.json;
      })
      .catch(handler);
  });

  it('GET /employees returns a list of all employees', function () {
    return agent.get('/employees')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
      })
      .catch(handler);
  });

  it('GET /employees/:id should return a specific employee ', function () {
    return agent.get('/employees/' + employee.id)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body[0]).to.be.a('object');
        // add a missing property due to alias in db query
        res.body[0].code = res.body[0].code_employee;
        expect(res.body[0]).to.contain.all.keys(employee);
      })
      .catch(handler);
  });

  it('PUT /employee/:id should update an existing employee ', function () {
    return agent.put('/employees/' + employee.id)
      .send(updateEmployee)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body[0]).to.be.a('object');
        // add a missing property due to alias in db query
        res.body[0].code = res.body[0].code_employee;
        expect(res.body[0]).to.contain.all.keys(updateEmployee);
        for(var i in updateEmployee) {
          expect(res.body[0][i]).to.be.equals(updateEmployee[i]);
        }
      })
      .catch(handler);
  });

  it('PUT /employee/:id should not update an existing employee with a fake Id ', function () {
    return agent.put('/employees/fakeId')
      .send(updateEmployee)
      .then(function (res) {
        expect(res).to.have.status(404);
      })
      .catch(handler);
  });

  it('PUT /employee/:idb should not update an existing employee with a fake data ', function () {
    return agent.put('/employees/' + employee.id)
      .send({})
      .then(function (res) {
        expect(res).to.not.have.status(200);
        return agent.get('/employees/' + employee.id)
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body[0]).to.be.a('object');
        expect(res.body[0]).to.have.property('id');
      })
      .catch(handler);
  });

});
