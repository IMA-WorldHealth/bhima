const chai = require('chai');
const expect = chai.expect;

const helpers = require('./helpers');
helpers.configure(chai);

describe('Patient Check In', () => {
  'use strict';

  const patientUuid = '81af634f-321a-40de-bc6f-ceb1167a9f65';
  
  const agent = chai.request.agent(helpers.baseUrl);
  before(helpers.login(agent));

  it('GET /patients/:uuid/visits returns a list of all patient visits', () => { 
    return agent.get(`/patients/${patientUuid}/visits`)
      .then(function (result) { 
        const BASE_VISITS = 2;
        
        expect(result).to.have.status(200); 
        expect(result.body.length).to.equal(BASE_VISITS);
        expect(result.body[0]).to.have.keys('patient_uuid', 'start_date', 'end_date', 'user_id', 'username');
      })
      .catch(helpers.api.help);
  })
});
