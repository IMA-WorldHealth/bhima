/* global expect, chai, agent */

const helpers = require('./helpers');
const q = require('q');

describe('(/patients) Patients', function () {
  'use strict';

  const patientUuid = '81af634f-321a-40de-bc6f-ceb1167a9f65';

  // TODO Should this import UUID library and track mock patient throughout?
  var mockPatientUuid = '85bf7a85-16d9-4ae5-b5c0-1fec9748d2f9';
  var mockDebtorUuid = 'ec4241e4-3558-493b-9d78-dbaa47e3cefd';
  var missingPatientUuid = 'd74bc167-3e14-487e-af78-22fd725e4ac1';

  var mockDebtor = {
    uuid:                mockDebtorUuid,
    debtor_group_uuid:  '4de0fe47-177f-4d30-b95f-cff8166400b4'
  };

  var mockPatient = {
    display_name:        'Mock Patient First',
    dob:                 new Date ('1993-06-01'),
    current_location_id: '1f162a10-9f67-4788-9eff-c1fea42fcc9b',
    origin_location_id:  '1f162a10-9f67-4788-9eff-c1fea42fcc9b',
    sex:                 'M',
    project_id:          1,
    hospital_no:         120,
    uuid:                mockPatientUuid,
  };

  // missing last name, sex
  var missingParamsPatient = {
    display_name:          'Mock Patient',
    dob:                 new Date('1993-06-01'),
    current_location_id: '1f162a10-9f67-4788-9eff-c1fea42fcc9b',
    origin_location_id:  '1f162a10-9f67-4788-9eff-c1fea42fcc9b',
    project_id:          1,
    hospital_no:         121,
    uuid:                missingPatientUuid,
  };

  var mockRequest = {
    finance : mockDebtor,
    medical : mockPatient
  };

  var mockMissingRequest = {
    finance : {
      debtor_group_uuid : '4de0fe47-177f-4d30-b95f-cff8166400b4'
    },
    medical : missingParamsPatient
  };

  var badRequest = {
    incorrectLayout : mockDebtor,
    incorrectTest : mockPatient
  };

  var simultaneousPatient = {
    display_name:        'Simultaneous Patient Mocks',
    dob:                 new Date('1993-06-01'),
    current_location_id: '1f162a10-9f67-4788-9eff-c1fea42fcc9b',
    origin_location_id:  '1f162a10-9f67-4788-9eff-c1fea42fcc9b',
    sex:                 'M',
    project_id:          1,
    hospital_no:         122,
  };

  var simultaneousRequest = {
    finance : {
      debtor_group_uuid : '4de0fe47-177f-4d30-b95f-cff8166400b4'
    },
    medical : simultaneousPatient
  };

  // HTTP API Test for /patients/search/ routes
  describe('(/search) Patient Search', function () {

    it('GET /patients with missing necessary parameters should succeed', function () {
      return agent.get('/patients/?')
        .then(function (res) {
          helpers.api.listed(res, 3);
        })
        .catch(helpers.handler);
    });

    it('GET /patients with \'reference\' parameter', function () {
      let conditions = { reference : 'PA.TPA.1' };
      return agent.get('/patients')
        .query(conditions)
        .then(function (res) {
          helpers.api.listed(res, 1);
        })
        .catch(helpers.handler);
    });

    it('GET /patients with \'display_name\' parameter', function () {
      let conditions = { display_name : 'Test' };
      return agent.get('/patients/')
        .query(conditions)
        .then(function (res) {
          helpers.api.listed(res, 2);
        })
        .catch(helpers.handler);
    });

    it('GET /patients/search/name with display_name parameter should return only a small subset of patient information', function () {
      let conditions = { display_name : 'Test' };

      return agent.get('/patients/search/name')
        .query(conditions)
        .then(function (res) {
          helpers.api.listed(res, 2);

          const firstRecord = res.body[0];
          expect(firstRecord).to.have.all.keys(['uuid', 'display_name', 'reference']);
        })
        .catch(helpers.handler);
    });

    it('GET /patients/search/name results in bad request with no name provided', function () {
      let conditions = {};

      return agent.get('/patients/search/name')
        .query(conditions)
        .then(function (res) {
          helpers.api.errored(res, 400);
        })
        .catch(helpers.handler);
    });

    it('GET /patients should be composable', function () {
      let conditions = { sex: 'M', display_name : 2 };
      return agent.get('/patients/')
        .query(conditions)
        .then(function (res) {
          helpers.api.listed(res, 1);
        })
        .catch(helpers.handler);
    });

    it('GET /patients with `name` and `reference` parameters for the priority of reference', function () {
      let conditions = { display_name : 'Test', reference : 'PA.TPA.1' };
      return agent.get('/patients/')
        .query(conditions)
        .then(function (res) {
          helpers.api.listed(res, 1);
          expect(res.body[0].reference).to.exist;
          expect(res.body[0].reference).to.be.equals(conditions.reference);
        })
        .catch(helpers.handler);
    });

    it('GET /patients with debtor_uuid retrieves the patients with that debtor_uuid', function () {
      let conditions = { debtor_uuid : '3be232f9-a4b9-4af6-984c-5d3f87d5c107' };
      return agent.get('/patients/')
        .query(conditions)
        .then(function (res) {
          helpers.api.listed(res, 1);
        })
        .catch(helpers.handler);
    });

    it('GET /patients with detailed and limit parameters', function () {
      let conditions = { detailed: 1, limit: 5, display_name: 'Test' };

      return agent.get('/patients/')
        .query(conditions)
        .then(function (res) {
          var expected = [
            'father_name', 'mother_name', 'profession', 'employer', 'spouse', 'spouse_employer',
            'spouse_profession', 'religion', 'marital_status', 'phone', 'email', 'address_1',
            'address_2', 'origin_location_id', 'current_location_id', 'registration_date',
            'title', 'notes', 'hospital_no', 'abbr', 'text', 'account_id', 'price_list_uuid',
            'is_convention', 'locked'
          ];

          helpers.api.listed(res, 2);

          expect(res.body[0]).to.contain.all.keys(expected);
          return agent.get('/patients/?display_name=Test&limit=1');
        })
        .then(function (res) {
          helpers.api.listed(res, 1);
        })
        .catch(helpers.handler);
    });

  });

  it('GET /patients returns a list of patients', function () {
    var INITIAL_TEST_PATIENTS = 2;

    return agent.get('/patients')
      .then(function (res) {
        helpers.api.listed(res, INITIAL_TEST_PATIENTS);
      })
      .catch(helpers.handler);
  });

  it('POST /patients will register a valid patient', function () {
    return agent.post('/patients')
      .send(mockRequest)
      .then(function (res) {
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  it('GET /patients/:uuid finds and retrieves the details of the registered patient', function () {
    return agent.get('/patients/' + mockPatientUuid)
      .then(function (res) {
        var retrievedDetails;
        var expectedKeys = ['uuid', 'display_name', 'sex', 'origin_location_id'];

        expect(res).to.have.status(200);
        retrievedDetails = res.body;

        expect(retrievedDetails).to.not.be.empty;
        expect(retrievedDetails).to.contain.keys(expectedKeys);

        expectedKeys.forEach(function (key) {
          expect(retrievedDetails[key]).to.equal(mockPatient[key]);
        });
      });
  });

  it('GET /patients/:uuid will return not found for invalid id', function () {
    return agent.get('/patients/unknownid')
      .then(function (res) {
        helpers.api.errored(res, 404);
      });
  });

  it('POST /patients will reject a patient with missing information', function () {
    return agent.post('/patients')
      .send(mockMissingRequest)
      .then(function (res) {
        helpers.api.errored(res, 400);
      })
      .catch(helpers.handler);
  });

  it('POST /patients will reject a patient with an incorrectly formatted request object', function () {
    return agent.post('/patients')
      .send(badRequest)
      .then(function (res) {
        helpers.api.errored(res, 400);
        expect(res.body.code).to.be.equal('ERRORS.BAD_REQUEST');
      })
      .catch(helpers.handler);

  });

  it.skip('Simultaneous patient registration requests respect reference lock', function () {

    // Custom timeout
    this.timeout(30000);

    let patientQuery = [];

    // Extreme case
    // var NUMBER_OF_PATIENTS = 200;
    // var timeoutInterval = 30;

    let NUMBER_OF_PATIENTS = 100;
    let timeoutInterval = 0;

    let timeout = 0;
    let baseHospitalNo = 300;

    // Setup all patient write requests
    for (var i = 0; i < NUMBER_OF_PATIENTS; i++) {
      patientQuery.push(delayPatientRequest(timeout, baseHospitalNo + i));
      timeout += timeoutInterval;
    }

    // Catch all patient write requests
    return q.all(patientQuery)
      .then(function (res) {
        var detailsQuery = [];


        // Setup all patient read requests
        res.forEach(function (patient) {
          helpers.api.created(patient);
          detailsQuery.push(agent.get('/patients/'.concat(patient.body.uuid)));
        });

        // Catch all patient read requests
        return q.all(detailsQuery);
      })
      .then(function (finalResult) {

        var references = [];

        // Verify unqiue references
        finalResult.forEach(function (patientDetail) {
          var patientReference;

          expect(patientDetail).to.have.status(200);

          patientReference = patientDetail.body.reference;
          expect(references).to.not.include(patientReference);

          references.push(patientReference);
        });
      })
      .catch(helpers.handler);
  });

  // hospital number uniqueness tests
  describe('/hospital_number/:id/exists', HospitalNumber);

  // patient group tests
  describe('(/:uuid/groups)', PatientGroups);

  describe('patient billing service', billingServices);

  describe('patient subsidies', subsidies);

  // TODO get information on the registered patient - ensure details route is correct
  function delayPatientRequest(timeout, hospitalNo) {
    const deferred = q.defer();

    setTimeout(function () {

      simultaneousRequest.medical.hospital_no = hospitalNo;

      let name = 'Patient ';
      let randomSuffix = (Math.random()*1.31).toString().slice(2, 10);
      simultaneousRequest.medical.display_name = name + randomSuffix;

      agent.post('/patients')
        .send(simultaneousRequest)
        .then(function (res) {
          deferred.resolve(res);
        })
        .catch(function (error) {
          deferred.reject(error);
        });
    }, timeout);

    return deferred.promise;
  }
});


// Tests for /patients/:uuid/groups
function PatientGroups() {
  'use strict';

  // shared constants
  const patientUuid = '81af634f-321a-40de-bc6f-ceb1167a9f65';
  const totalPatientGroups = 4;
  const subscribedPatientGroups = 1;

  it('GET /patients/:uuid/groups will return a list of the patients groups', function () {
    return agent.get(`/patients/${patientUuid}/groups`)
      .then(function (res) {
        helpers.api.listed(res, subscribedPatientGroups);
      })
      .catch(helpers.handler);
  });

  it('GET /patients/:uuid/groups will return 404 not found for invalid request', () =>{
    return agent.get('/patients/unknownid/groups')
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('POST /patients/:uuid/groups will update a patient\'s groups', () => {
   const assignments = ['112a9fb5-847d-4c6a-9b20-710fa8b4da24'];

   return agent.post(`/patients/${patientUuid}/groups`)
    .send({ assignments : assignments })
    .then(function (res) {
      expect(res).to.have.status(200);
      expect(res.body).to.not.be.empty;
      expect(res.body[0].affectedRows).to.equal(assignments.length);
    })
    .catch(helpers.handler);
  });
}


// Tests for /patients/hospital_number/:id/exists
function HospitalNumber() {
  'use strict';

  const existingNumber = 100;
  const absentNumber = 3.3;

  it('GET /patients/hospital_number/:id/exists returns true for a used number', function () {
    return agent.get(`/patients/hospital_number/${existingNumber}/exists`)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.text).to.equal('true');
      })
      .catch(helpers.handler);
  });

  it('GET /patients/hospital_number/:id/exists false for a new number', function () {
    return agent.get(`/patients/hospital_number/${absentNumber}/exists`)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.text).to.equal('false');
      })
      .catch(helpers.handler);
  });
}

//testing billing service

function billingServices() {
  'use strict';

  const patientUuid = '85bf7a85-16d9-4ae5-b5c0-1fec9748d2f9';
  const billingServiceAttached = 2;

  it('GET /patients/:uuid/services will return a list of the patients billing services', function () {
    return agent.get(`/patients/${patientUuid}/services`)
      .then(function (res) {
        helpers.api.listed(res, billingServiceAttached);
      })
      .catch(helpers.handler);
  });
}

//testing subsidies

function subsidies() {
  'use strict';

  const patientUuid = '85bf7a85-16d9-4ae5-b5c0-1fec9748d2f9';
  const subsidiesAttached = 1;

  it('GET /patients/:uuid/subsidies will return a list of the patients subsidies', function () {
    return agent.get(`/patients/${patientUuid}/subsidies`)
      .then(function (res) {
        helpers.api.listed(res, subsidiesAttached);
      })
      .catch(helpers.handler);
  });
}
