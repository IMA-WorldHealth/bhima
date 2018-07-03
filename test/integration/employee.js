/* global expect, chai, agent */

const helpers = require('./helpers');
const uuid = require('uuid/v4');

/*
 * The /employees API endpoint
 *
 * This test suite implements full CRUD on the /employees HTTP API endpoint.
 */
describe('(/employees) the employees API endpoint', () => {

  const numEmployees = 1;

  // custom dates
  const embaucheDate = new Date('2016-01-01');
  const dob1 = new Date('1987-04-17');
  const dob2 = new Date('1993-04-25');

  // employee we will add during this test suite.
  const employee = {
    uuid : '6b4642a7-4577-4768-b6ae-1b3d38f0bbef',
    code : 'x500',
    display_name : 'Magnus Carolus Charlemagne',
    sex : 'M',
    dob : dob1,
    date_embauche : embaucheDate,
    nb_spouse : 0,
    nb_enfant : 0,
    grade_uuid : '9ee06e4a-7b59-48e6-812c-c0f8a00cf7d3',
    bank : 'BIAC',
    bank_account : '00-99-88-77',
    email : 'me@info.com',
    fonction_id : 1,
    locked : 0,
    service_id : 1,
    is_medical : 0,
    hospital_no : 'TP30',
    creditor_group_uuid : 'b0fa5ed2-04f9-4cb3-92f7-61d6404696e7',
    debtor_group_uuid : '4de0fe47-177f-4d30-b95f-cff8166400b4',
    current_location_id : '1f162a10-9f67-4788-9eff-c1fea42fcc9b',
    origin_location_id :  '1f162a10-9f67-4788-9eff-c1fea42fcc9b',
    payroll : {
      5 : 10,
      7 : 15,
    },
  };

  const updateEmployee = {
    code : 'x500',
    display_name : 'Charle Magne De France',
    sex : 'M',
    dob : dob2,
    date_embauche : embaucheDate,
    nb_spouse : 0,
    nb_enfant : 0,
    hospital_no : 'HBB 2017',
    grade_uuid : '9ee06e4a-7b59-48e6-812c-c0f8a00cf7d3',
    bank : 'BIAC',
    bank_account : '00-99-88-77',
    email : 'me@info.com',
    fonction_id : 1,
    service_id : 1,
    is_medical : 0,
    creditor_group_uuid : 'b0fa5ed2-04f9-4cb3-92f7-61d6404696e7',
    debtor_group_uuid : '4de0fe47-177f-4d30-b95f-cff8166400b4',
    current_location_id : '1f162a10-9f67-4788-9eff-c1fea42fcc9b',
    origin_location_id :  '1f162a10-9f67-4788-9eff-c1fea42fcc9b',
  };

  var patient = {
    code : 'bcdc2018',
    display_name : 'Test 1 Patient',
    patient_uuid : '81af634f-321a-40de-bc6f-ceb1167a9f65',
    debtor_uuid : 'a11e6b7f-fbbb-432e-ac2a-5312a66dccf4',
    date_embauche : embaucheDate,
    nb_spouse : 0,
    nb_enfant : 0,
    grade_uuid : '9ee06e4a-7b59-48e6-812c-c0f8a00cf7d3',
    bank : 'AIG',
    bank_account : '1986O709',
    email : 'me@info.com',
    fonction_id : 1,
    locked : 0,
    service_id : 1,
    is_medical : 0,
    hospital_no : 'TP30',
    creditor_group_uuid : 'b0fa5ed2-04f9-4cb3-92f7-61d6404696e7',
    debtor_group_uuid : '4de0fe47-177f-4d30-b95f-cff8166400b4',
    current_location_id: '1f162a10-9f67-4788-9eff-c1fea42fcc9b',
    origin_location_id:  '1f162a10-9f67-4788-9eff-c1fea42fcc9b'
  };

  const searchEmployee = 'Test 2 Patient';

  it('POST /employee should create a new employee', () => {
    return agent.post('/employees')
      .send(employee)
      .then((res) => {
        helpers.api.created(res);
        employee.uuid = res.body.uuid;
        updateEmployee.patient_uuid = res.body.patient_uuid;
      })
      .catch(helpers.handler);
  });

  it('POST /employees/patient_employee Register an employee from a patient', function () {
    return agent.post('/employees/patient_employee')
      .send(patient)
      .then(function (res) {
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  it('POST /employee should return a 400 error for an empty object', () => {
    return agent.post('/employees')
      .send({})
      .then((res) => {
        helpers.api.errored(res, 400);
      })
      .catch(helpers.handler);
  });

  it('GET /employees returns a list of all employees', () => {
    return agent.get('/employees')
      .then((res) => {
        helpers.api.listed(res, 4);
      })
      .catch(helpers.handler);
  });

  it('GET /employees/:uuid should return a specific employee', () => {
    return agent.get(`/employees/${employee.uuid}`)
      .then((res) => {
        const keyEmployeeTest = employee;
        delete keyEmployeeTest.hospital_no;
        delete keyEmployeeTest.current_location_id;
        delete keyEmployeeTest.origin_location_id;

        const emp = res.body;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');

        // add a missing property due to alias in db query
        emp.code = emp.code_employee;
        // expect(emp).to.contain.all.keys(employee);
      })
      .catch(helpers.handler);
  });

  it('GET /employees with \'code\' parameter', () => {
    const conditions = { code : 'x500' };
    return agent.get('/employees')
      .query(conditions)
      .then((res) => {
        helpers.api.listed(res, 1);
      })
      .catch(helpers.handler);
  });

  it('GET /employees with \'display_name\' parameter', () => {
    const conditions = { display_name : searchEmployee };
    return agent.get('/employees')
      .query(conditions)
      .then((res) => {
        helpers.api.listed(res, 1);
      })
      .catch(helpers.handler);
  });

  it('GET /employees should be composable when using parameters', () => {
    const conditions = { sex : 'M', display_name : searchEmployee };
    return agent.get('/employees')
      .query(conditions)
      .then((res) => {
        helpers.api.listed(res, 1);
      })
      .catch(helpers.handler);
  });

  it('GET /employees with `name` and `code` parameters for the priority of reference', () => {
    const conditions = { display_name : searchEmployee, code : 'E1' };
    return agent.get('/employees')
      .query(conditions)
      .then((res) => {
        helpers.api.listed(res, 1);
        expect(res.body[0].code).to.exist;
        expect(res.body[0].code).to.be.equals(conditions.code);
      })
      .catch(helpers.handler);
  });

  it('GET /employees filter employee of a given service', () => {
    const conditions = { service_id : 1 };
    return agent.get('/employees')
      .query(conditions)
      .then((res) => {
        helpers.api.listed(res, 3);
        expect(res.body[0].service_id).to.exist;
        expect(res.body[0].service_id).to.be.equals(conditions.service_id);
      })
      .catch(helpers.handler);
  });

  it('GET /employees with limit parameters', () => {
    const conditions = { limit : 5, sex : 'M' };

    return agent.get('/employees')
      .query(conditions)
      .then((res) => {
        const expected = [
          'nb_spouse', 'nb_enfant', 'bank', 'bank_account',
          'adresse', 'phone', 'email', 'fonction_id', 'fonction_txt',
          'grade_uuid', 'basic_salary', 'service_id',
          'creditor_uuid', 'locked',
        ];

        helpers.api.listed(res, 2);

        expect(res.body[0]).to.contain.all.keys(expected);
        return agent.get('/employees/?display_name=Charle&limit=1');
      })
      .then((res) => {
        helpers.api.listed(res, 1);
      })
      .catch(helpers.handler);
  });

  it('PUT /employee/:uuid should update an existing employee ', () => {
    return agent.put(`/employees/${employee.uuid}`)
      .send(updateEmployee)
      .then((res) => {
        const emp = res.body;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(emp).to.be.a('object');
        checkValidUpdate(emp, updateEmployee);
      })
      .catch(helpers.handler);
  });

  it('PUT /employee/:uuid should not update an existing employee with a fake Id ', () => {
    return agent.put('/employees/fakeId')
      .send(updateEmployee)
      .then((res) => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('PUT /employee/:uuid should not update an existing employee with fake fields ', () => {
    return agent.put(`/employees/${employee.uuid}`)
      .send({
        code : 'NEW_CODE_X',
        fakeAttribute1 : 'fake value 1',
        fakeAttribute2 : 'fake value 2',
      })
      .then((res) => {
        helpers.api.errored(res, 400);
        return agent.get(`/employees/${employee.uuid}`);
      })
      .then((res) => {
        const emp = res.body;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(emp).to.be.a('object');
        checkValidUpdate(emp, updateEmployee);
      })
      .catch(helpers.handler);
  });

  /**
   * @function checkValidUpdate
   * @desc This function test if an updated value returned by the server
   * correspond correctly to the update sended
   * @param {object} emp The employee object to test
   * @param {object} update The correct employee update
   */
  function checkValidUpdate(employee, update) {
    for (const i in update) {
      if (i === 'dob' || i === 'date_embauche') {
        expect(new Date(employee[i])).to.equalDate(new Date(update[i]));
      } else {
        expect(employee[i]).to.equal(update[i]);
      }
    }
  }

});
