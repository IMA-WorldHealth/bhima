/* global expect, chai, agent */
/* jshint expr : true */

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
    first_name:          'Mock',
    middle_name:         'Patient',
    last_name:           'First',
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
    first_name:          'Mock',
    middle_name:         'Patient',
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
    first_name:          'Simultaneous',
    middle_name:         'Patient',
    last_name:           'Last',
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

    it('GET /patients/search with missing necessary parameters', function () {
      return agent.get('/patients/search/?')
        .then(function (res) {
          helpers.api.errored(res, 400);

          expect(res.body.code).to.be.equals('ERRORS.PARAMETERS_REQUIRED');
          return agent.get('/patients/search');
        })
        .then(function (res) {
          helpers.api.errored(res, 400);
          expect(res.body.code).to.be.equals('ERRORS.PARAMETERS_REQUIRED');
        })
        .catch(helpers.handler);
    });

    it('GET /patients/search with \'reference\' parameter', function () {
      return agent.get('/patients/search/?reference=TPA1')
        .then(function (res) {
          helpers.api.listed(res, 1);
        })
        .catch(helpers.handler);
    });

    it('GET /patients/search with \'name\' parameter', function () {
      let conditions = { name : 'Test' };
      return agent.get('/patients/search/')
        .query(conditions)
        .then(function (res) {
          helpers.api.listed(res, 2);
        })
        .catch(helpers.handler);
    });

    it('GET /patients/search should be composable', function () {
      let conditions = { sex: 'M', last_name: 2 };
      return agent.get('/patients/search/')
        .query(conditions)
        .then(function (res) {
          helpers.api.listed(res, 1);
        })
        .catch(helpers.handler);
    });

    it('GET /patients/search with `name` and `reference` parameters for the priority of reference', function () {
      let conditions = { name : 'Test', reference : 'TPA1' };
      return agent.get('/patients/search/')
        .query(conditions)
        .then(function (res) {
          helpers.api.listed(res, 1);
          expect(res.body[0].reference).to.exist;
          expect(res.body[0].reference).to.be.equals('TPA1');
        })
        .catch(helpers.handler);
    });

    it('GET /patients/search with detailed and limit parameters', function () {
      let conditions = { detailed: 1, limit: 5, name: 'Test' };

      return agent.get('/patients/search/')
        .query(conditions)
        .then(function (res) {
          var expected = [
            'father_name', 'mother_name', 'profession', 'employer', 'spouse', 'spouse_employer',
            'spouse_profession', 'religion', 'marital_status', 'phone', 'email', 'address_1',
            'address_2', 'renewal', 'origin_location_id', 'current_location_id', 'registration_date',
            'title', 'notes', 'hospital_no', 'abbr', 'text', 'account_id', 'price_list_uuid',
            'is_convention', 'locked'
          ];

          helpers.api.listed(res, 2);

          expect(res.body[0]).to.contain.all.keys(expected);
          return agent.get('/patients/search/?name=Test&limit=1');
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
        var expectedKeys = ['uuid', 'last_name', 'middle_name', 'sex', 'origin_location_id'];

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

  it('Simultaneous patient registration requests respect reference lock', function () {

    // Custom timeout
    this.timeout(30000);

    var patientQuery = [];

    // Extreme case
    // var NUMBER_OF_PATIENTS = 200;
    // var timeoutInterval = 30;

    var NUMBER_OF_PATIENTS = 7;
    var timeoutInterval = 0;

    var timeout = 0;
    var baseHospitalNo = 1000;

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

  // TODO get information on the registered patient - ensure details route is correct
  function delayPatientRequest(timeout, hospitalNo) {
    const deferred = q.defer();

    setTimeout(function () {

      simultaneousRequest.medical.hospital_no = hospitalNo;
      simultaneousRequest.medical.last_name += hospitalNo;

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
