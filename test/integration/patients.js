/* global expect, agent */
'use strict';

const helpers = require('./helpers');
const q = require('q');

describe('(/patients) Patients', function () {
  // TODO Should this import UUID library and track mock patient throughout?
  const mockPatientUuid = '85bf7a85-16d9-4ae5-b5c0-1fec9748d2f9';
  const mockDebtorUuid = 'ec4241e4-3558-493b-9d78-dbaa47e3cefd';
  const missingPatientUuid = 'd74bc167-3e14-487e-af78-22fd725e4ac1';

  const mockDebtor = {
    uuid : mockDebtorUuid,
    debtor_group_uuid : '4de0fe47-177f-4d30-b95f-cff8166400b4',
  };

  const mockPatient = {
    display_name : 'Mock Patient First',
    dob : new Date('1993-06-01'),
    current_location_id : '1f162a10-9f67-4788-9eff-c1fea42fcc9b',
    origin_location_id : '1f162a10-9f67-4788-9eff-c1fea42fcc9b',
    sex : 'M',
    project_id : 1,
    hospital_no : 120,
    uuid : mockPatientUuid,
  };

  // missing last name, sex
  const missingParamsPatient = {
    display_name : 'Mock Patient',
    dob : new Date('1993-06-01'),
    current_location_id : '1f162a10-9f67-4788-9eff-c1fea42fcc9b',
    origin_location_id : '1f162a10-9f67-4788-9eff-c1fea42fcc9b',
    project_id : 1,
    hospital_no : 121,
    uuid : missingPatientUuid,
  };

  const mockRequest = {
    finance : mockDebtor,
    medical : mockPatient,
  };

  const mockMissingRequest = {
    finance : {
      debtor_group_uuid : '4de0fe47-177f-4d30-b95f-cff8166400b4',
    },
    medical : missingParamsPatient,
  };

  const badRequest = {
    incorrectLayout : mockDebtor,
    incorrectTest : mockPatient,
  };

  const simultaneousPatient = {
    display_name : 'Simultaneous Patient Mocks',
    dob : new Date('1993-06-01'),
    current_location_id : '1f162a10-9f67-4788-9eff-c1fea42fcc9b',
    origin_location_id : '1f162a10-9f67-4788-9eff-c1fea42fcc9b',
    sex : 'M',
    project_id : 1,
    hospital_no : 122,
  };

  const simultaneousRequest = {
    finance : {
      debtor_group_uuid : '4de0fe47-177f-4d30-b95f-cff8166400b4',
    },
    medical : simultaneousPatient,
  };

  // HTTP API Test for /patients/  routes
  describe('Patient Search', function () {

    it('GET /patients with missing necessary parameters should succeed', function () {
      return agent.get('/patients/?')
        .then((res) => {
          helpers.api.listed(res, 3);
        })
        .catch(helpers.handler);
    });

    it('GET /patients with \'reference\' parameter', function () {
      const conditions = { reference : 'PA.TPA.1' };
      return agent.get('/patients')
        .query(conditions)
        .then((res) => {
          helpers.api.listed(res, 1);
        })
        .catch(helpers.handler);
    });

    it('GET /patients with \'display_name\' parameter', function () {
      const conditions = { display_name : 'Test' };
      return agent.get('/patients/')
        .query(conditions)
        .then((res) => {
          helpers.api.listed(res, 2);
        })
        .catch(helpers.handler);
    });

    it('GET /patients/search/name with display_name parameter should return only a small subset of patient information', function () {
      const conditions = { display_name : 'Test' };
      return agent.get('/patients/search/name')
        .query(conditions)
        .then((res) => {
          helpers.api.listed(res, 2);

          const firstRecord = res.body[0];
          expect(firstRecord).to.have.all.keys(['uuid', 'display_name', 'reference', 'color']);
        })
        .catch(helpers.handler);
    });

    it('GET /patients/search/name results in bad request with no name provided', function () {
      const conditions = {};
      return agent.get('/patients/search/name')
        .query(conditions)
        .then((res) => {
          helpers.api.errored(res, 400);
        })
        .catch(helpers.handler);
    });

    it('GET /patients should be composable', function () {
      const conditions = { sex: 'M', display_name : 2 };
      return agent.get('/patients')
        .query(conditions)
        .then((res) => {
          helpers.api.listed(res, 1);
        })
        .catch(helpers.handler);
    });

    it('GET /patients with `name` and `reference` parameters for the priority of reference', function () {
      const conditions = { display_name : 'Test', reference : 'PA.TPA.1' };
      return agent.get('/patients')
        .query(conditions)
        .then((res) => {
          helpers.api.listed(res, 1);
          expect(res.body[0].reference).to.exist;
          expect(res.body[0].reference).to.be.equals(conditions.reference);
        })
        .catch(helpers.handler);
    });

    it('GET /patients with debtor_uuid retrieves the patients with that debtor_uuid', function () {
      const conditions = { debtor_uuid : '3be232f9-a4b9-4af6-984c-5d3f87d5c107' };
      return agent.get('/patients')
        .query(conditions)
        .then((res) => {
          helpers.api.listed(res, 1);
        })
        .catch(helpers.handler);
    });

    it('GET /patients with detailed and limit parameters', function () {
      const conditions = { detailed : 1, limit : 5, display_name : 'Test' };
      return agent.get('/patients')
        .query(conditions)
        .then((res) => {
          const expected = [
            'father_name', 'mother_name', 'profession', 'employer', 'spouse', 'spouse_employer',
            'spouse_profession', 'religion', 'marital_status', 'phone', 'email', 'address_1',
            'address_2', 'origin_location_id', 'current_location_id', 'registration_date',
            'title', 'notes', 'hospital_no', 'abbr', 'text', 'account_id', 'price_list_uuid',
            'is_convention', 'locked',
          ];

          helpers.api.listed(res, 2);

          expect(res.body[0]).to.contain.all.keys(expected);
          return agent.get('/patients/?display_name=Test&limit=1');
        })
        .then((res) => {
          helpers.api.listed(res, 1);
        })
        .catch(helpers.handler);
    });
  });

  it('GET /patients returns a list of patients', function () {
    const INITIAL_TEST_PATIENTS = 2;
    return agent.get('/patients')
      .then((res) => {
        helpers.api.listed(res, INITIAL_TEST_PATIENTS);
      })
      .catch(helpers.handler);
  });

  it('POST /patients will register a valid patient', function () {
    return agent.post('/patients')
      .send(mockRequest)
      .then((res) => {
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  it('GET /patients/:uuid finds and retrieves the details of the registered patient', function () {
    return agent.get('/patients/' + mockPatientUuid)
      .then((res) => {
        const expectedKeys = ['uuid', 'display_name', 'sex', 'origin_location_id'];

        expect(res).to.have.status(200);
        const retrievedDetails = res.body;

        expect(retrievedDetails).to.not.be.empty;
        expect(retrievedDetails).to.contain.keys(expectedKeys);

        expectedKeys.forEach((key) => {
          expect(retrievedDetails[key]).to.equal(mockPatient[key]);
        });
      });
  });

  it('GET /patients/:uuid will return not found for invalid id', function () {
    return agent.get('/patients/unknownid')
      .then((res) => {
        helpers.api.errored(res, 404);
      });
  });

  it('POST /patients will reject a patient with missing information', function () {
    return agent.post('/patients')
      .send(mockMissingRequest)
      .then((res) => {
        helpers.api.errored(res, 400);
      })
      .catch(helpers.handler);
  });

  it('POST /patients will reject a patient with an incorrectly formatted request object', function () {
    return agent.post('/patients')
      .send(badRequest)
      .then((res) => {
        helpers.api.errored(res, 400);
        expect(res.body.code).to.be.equal('ERRORS.BAD_REQUEST');
      })
      .catch(helpers.handler);
  });

  // hospital number uniqueness tests
  describe('/hospital_number/:id/exists', HospitalNumber);

  // patient group tests
  describe('(/:uuid/groups)', PatientGroups);

  describe('patient billing service', billingServices);

  describe('patient subsidies', subsidies);
});

// Tests for /patients/:uuid/groups
function PatientGroups() {

  // shared constants
  const patientUuid = '81af634f-321a-40de-bc6f-ceb1167a9f65';
  const subscribedPatientGroups = 1;

  it('GET /patients/:uuid/groups will return a list of the patients groups', function () {
    return agent.get(`/patients/${patientUuid}/groups`)
      .then((res) => {
        helpers.api.listed(res, subscribedPatientGroups);
      })
      .catch(helpers.handler);
  });

  it('GET /patients/:uuid/groups will return 404 not found for invalid request', () =>{
    return agent.get('/patients/unknownid/groups')
      .then((res) => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('POST /patients/:uuid/groups will update a patient\'s groups', () => {
    const assignments = ['112a9fb5-847d-4c6a-9b20-710fa8b4da24'];

    return agent.post(`/patients/${patientUuid}/groups`)
     .send({ assignments })
     .then((res) => {
       expect(res).to.have.status(200);
       expect(res.body).to.not.be.empty;
       expect(res.body[0].affectedRows).to.equal(assignments.length);
     })
     .catch(helpers.handler);
  });
}


// Tests for /patients/hospital_number/:id/exists
function HospitalNumber() {
  const existingNumber = 100;
  const absentNumber = 3.3;

  it('GET /patients/hospital_number/:id/exists returns true for a used number', function () {
    return agent.get(`/patients/hospital_number/${existingNumber}/exists`)
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.text).to.equal('true');
      })
      .catch(helpers.handler);
  });

  it('GET /patients/hospital_number/:id/exists false for a new number', function () {
    return agent.get(`/patients/hospital_number/${absentNumber}/exists`)
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.text).to.equal('false');
      })
      .catch(helpers.handler);
  });
}

function billingServices() {
  const patientUuid = '85bf7a85-16d9-4ae5-b5c0-1fec9748d2f9';
  const billingServiceAttached = 2;

  it('GET /patients/:uuid/services will return a list of the patients billing services', function () {
    return agent.get(`/patients/${patientUuid}/services`)
      .then((res) => {
        helpers.api.listed(res, billingServiceAttached);
      })
      .catch(helpers.handler);
  });
}

function subsidies() {
  const patientUuid = '85bf7a85-16d9-4ae5-b5c0-1fec9748d2f9';
  const subsidiesAttached = 1;

  it('GET /patients/:uuid/subsidies will return a list of the patients subsidies', function () {
    return agent.get(`/patients/${patientUuid}/subsidies`)
      .then((res) => {
        helpers.api.listed(res, subsidiesAttached);
      })
      .catch(helpers.handler);
  });
}
