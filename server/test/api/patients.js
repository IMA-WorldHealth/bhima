var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;

var q = require('q');

var url = 'https://localhost:8080';
var user = { 
  username : 'superuser', 
  password : 'superuser', 
  project: 1
};

chai.use(chaiHttp);

// workaround for low node versions
if (!global.Promise) {
  var q = require('q');
  chai.request.addPromises(q.Promise);
}

// Environment variables - disable certificate errors
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

describe('The /patients API', function () { 
  var agent = chai.request.agent(url);
  
  var preparedTestPatientUuid = '81af634f-321a-40de-bc6f-ceb1167a9f65';

  // TODO Should this import UUID library and track mock patient throughout?
  var mockPatientUuid = '85bf7a85-16d9-4ae5-b5c0-1fec9748d2f9';
  var mockDebtorUuid = 'ec4241e4-3558-493b-9d78-dbaa47e3cefd';
  var missingPatientUuid = 'd74bc167-3e14-487e-af78-22fd725e4ac1';

  var mockDebtor = { 
    uuid : mockDebtorUuid,
    debitor_group_uuid : '4de0fe47-177f-4d30-b95f-cff8166400b4'
  };
  var mockPatient = { 
    first_name : 'Mock',
    middle_name : 'Patient', 
    last_name : 'First',
    dob : '1993-06-01T00:00:00.000Z',
    current_location_id : 'bda70b4b-8143-47cf-a683-e4ea7ddd4cff',
    origin_location_id : 'bda70b4b-8143-47cf-a683-e4ea7ddd4cff',
    sex : 'M',
    project_id : 1,
    hospital_no : 120,
    uuid : mockPatientUuid,
  };
  
  // Missing last name, sex
  var missingParamsPatient = { 
    first_name : 'Mock',
    middle_name : 'Patient', 
    dob : '1993-06-01T00:00:00.000Z',
    current_location_id : 'bda70b4b-8143-47cf-a683-e4ea7ddd4cff',
    origin_location_id : 'bda70b4b-8143-47cf-a683-e4ea7ddd4cff',
    project_id : 1,
    hospital_no : 121,
    uuid : missingPatientUuid,
  };

  var mockRequest = { 
    finance : mockDebtor,
    medical : mockPatient
  };
  var mockMissingRequest = { 
    finance : {
      debitor_group_uuid : '4de0fe47-177f-4d30-b95f-cff8166400b4'
    },
    medical : missingParamsPatient
  };
  var badRequest = { 
    incorrectLayout : mockDebtor,
    incorrectTest : mockPatient
  }
  
  var simultaneousPatient = { 
    first_name : 'Simultaneous',
    middle_name : 'Patient', 
    last_name : 'Last',
    dob : '1993-06-01T00:00:00.000Z',
    current_location_id : 'bda70b4b-8143-47cf-a683-e4ea7ddd4cff',
    origin_location_id : 'bda70b4b-8143-47cf-a683-e4ea7ddd4cff',
    sex : 'M',
    project_id : 1,
    hospital_no : 122,
  };

  var simultaneousRequest = { 
    finance : { 
      debitor_group_uuid : '4de0fe47-177f-4d30-b95f-cff8166400b4'
    }, 
    medical : simultaneousPatient
  };

  // Assumes test database is built with the following information
  // Logs in before each test
  beforeEach(function () {
    return agent
      .post('/login')
      .send(user);
  });
  
  it('GET /patients returns a list of patients', function () {
    var INITIAL_TEST_PATIENTS = 2;

    return agent.get('/patients')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(res.body).to.have.length(INITIAL_TEST_PATIENTS);
      })
      .catch(handle);
  });

  it('POST /patients will register a valid patient', function () { 
    var UUID_LENGTH = 36;

    return agent.post('/patients')
      .send(mockRequest)
      .then(function (confirmation) { 
        expect(confirmation).to.have.status(201); 
        expect(confirmation.body).to.contain.keys('uuid');
        expect(confirmation.body.uuid.length).to.equal(UUID_LENGTH);
        
      })
      .catch(handle);
  });

  it('GET /patients/:id finds and retrieves the details of the registered patient', function () { 
    return agent.get('/patients/' + mockPatientUuid)
      .then(function (result) { 
        var retrievedDetails;
        var expectedKeys = ['uuid', 'last_name', 'middle_name', 'sex', 'origin_location_id'];

        expect(result).to.have.status(200);
        retrievedDetails = result.body;

        expect(retrievedDetails).to.not.be.empty;
        expect(retrievedDetails).to.contain.keys(expectedKeys);

        expectedKeys.forEach(function (key) { 
          expect(retrievedDetails[key]).to.equal(mockPatient[key]);
        });
      });
  });

  it('GET /patients/:id will return not found for invalid id', function () { 
    return agent.get('/patients/unkownid')
      .then(function (result) { 
        expect(result).to.have.status(404);
        expect(result.body).to.not.be.empty;
      });
  });

  it('POST /patients will reject a patient with missing information', function () { 
    return agent.post('/patients')
      .send(mockMissingRequest)
      .then(function (result) { 
        expect(result).to.have.status(400);
      })
      .catch(handle);
  });
  
  it('POST /patients will reject a patient with an incorrectly formatted request object', function () { 
    return agent.post('/patients')
      .send(badRequest)
      .then(function (result) { 
        expect(result).to.have.status(400);
        expect(result.body).to.have.keys('code', 'reason');
        expect(result.body.code).to.be.equal('ERROR.ERR_MISSING_INFO');
      })
      .catch(handle);

  });

  it('GET /patients/:id/groups will return a list of the patients groups', function () { 
    var groupRoute = '/patients/'.concat(preparedTestPatientUuid).concat('/groups');
    var SUBSCRIBED_PATIENT_GROUPS = 1;

    return agent.get(groupRoute)
      .then(function (result) { 
        expect(result).to.have.status(200);
        expect(result.body).to.not.be.empty;
        expect(result.body).to.have.length(SUBSCRIBED_PATIENT_GROUPS);
      })
      .catch(handle);
  });

  if('GET /patients/:id/groups will return 404 not found for invalid request', function () { 
    
    return agent.get('/patient/unkownid/groups')
      .then(function (result) { 
        expect(result).to.have.status(404);
        expect(result.body).to.not.be.empty;
      })
      .catch(handle);
  });

  it('GET /patients/groups will return a list of all patient groups', function () { 
    var TOTAL_PATIENT_GROUPS = 2;
    
    return agent.get('/patients/groups')
      .then(function (result) { 
        expect(result).to.have.status(200);
        expect(result.body).to.not.be.empty;
        expect(result.body).to.have.length(TOTAL_PATIENT_GROUPS);
      })
      .catch(handle);
  }); 

  it('Simultaneous patient registration requests respect reference lock', function () { 
    
    // Custom timeout 
    this.timeout(30000);
    
    var patientQuery = [];

    // Extreme case 
    // var NUMBER_OF_PATIENTS = 200;
    // var timeoutInterval = 30;

    var NUMBER_OF_PATIENTS = 3;
    var timeoutInterval = 0;
  
    var timeout = 0;
    var baseHospitalNo = 1000;
  
    // Settup all patient write requests 
    for (var i = 0; i < NUMBER_OF_PATIENTS; i++) { 
      patientQuery.push(delayPatientRequest(timeout, baseHospitalNo + i));
      timeout += timeoutInterval;
    }
    
    // Catch all patient write requests
    return q.all(patientQuery)
      .then(function (result) { 
        var detailsQuery = [];
  
              
        // Settup all patient read requests
        result.forEach(function (patient) { 
          expect(patient).to.have.status(201);
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
      .catch(handle);
  });
  
 describe('Updating patient group assignment', function () { 

   it('POST /patients/:id/groups will update a patients groups', function () { 
     
     // 0b8fcc00-8640-479d-872a-31d36361fcfd
     var groupAssignment = { 
       assignments : ['112a9fb5-847d-4c6a-9b20-710fa8b4da24']
     };
    
     return agent.post('/patients/'.concat(mockPatientUuid, '/groups'))
      .send(groupAssignment)
      .then(function (result) { 

        var assignResult;
        
        expect(result).to.have.status(200);
        expect(result.body).to.not.be.empty;
        
        assignResult = result.body[1];

        expect(assignResult.affectedRows).to.equal(groupAssignment.assignments.length);
      })
      .catch(handle);
   });
  
   /* 
   it('Specified patients group assignments reflect the recent update', function () { 
      
     // Not implemented
     expect(true).to.be.false;
   });

   it('POST /patients/:id/groups will fail with 400 for a bad group request', function () { 
      
     // Not implemented
     expect(true).to.be.false;
   });

   it('POST /patients/:id/groups will fail with 400 for an invalid patient ID', function () { 

     // Not implemented
     expect(true).to.be.false;
   });

   it('POST /patients/:id/groups will fail with 400 MISSING_INFO if no assignments object is passed', function () { 
    
     // Not implemented
     expect(true).to.be.false;
   });

   it('POST /patients/:id/groups with no group assignments removes all patients group assignments', function () { 
      
     // Not implemented
     expect(true).to.be.false;
    });*/
  });
   
  // TODO get information on the registered patient - ensure details route is correct 
  // TODO Reject duplicate hospital number
  // TODO Test that transaction is rolled back successfully gien invalid patient
  
  function delayPatientRequest(timeout, hospitalNo) { 
    var deferred = q.defer();
    
    setTimeout(function () { 
    
      simultaneousRequest.medical.hospital_no = hospitalNo;
      
      agent.post('/patients')
        .send(simultaneousRequest)
        .then(function (result) { 

          deferred.resolve(result);
        })
        .catch(function (error) { 
          deferred.reject(error);
        });
    }, 
    timeout);

    return deferred.promise;
  }

  function handle(error) {
    throw error;
  }
});

