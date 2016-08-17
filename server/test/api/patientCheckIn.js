/* global expect, chai, agent */
/* jshint expr : true */

const helpers = require('./helpers');

describe('(/patients/:uuid/visits) Patient Check In', () => {
  'use strict';

  const patientUuid = '81af634f-321a-40de-bc6f-ceb1167a9f65';
  const debtorUuid = '3be232f9-a4b9-4af6-984c-5d3f87d5c107';

  it('GET /patients/:uuid/visits returns a list of all patient visits', () => {
    return agent.get(`/patients/${patientUuid}/visits`)
      .then(function (result) {
        const BASE_VISITS = 2;
        expect(result).to.have.status(200);
        expect(result.body.length).to.equal(BASE_VISITS);
        expect(result.body[0]).to.have.keys('patient_uuid', 'start_date', 'end_date', 'user_id', 'username');
      })
      .catch(helpers.api.help);
  });

  it('GET /patients/:uuid/visits?limit=n limits the results', () => {
    const LIMIT = 1;
    return agent.get(`/patients/${patientUuid}/visits`)
      .query({ limit : LIMIT })
      .then(function (result) {
        expect(result).to.have.status(200);
        expect(result.body.length).to.equal(LIMIT);
        expect(result.body[0]).to.have.keys('patient_uuid', 'start_date', 'end_date', 'user_id', 'username');
      })
      .catch(helpers.api.help);
  });

  it('POST /patients/:uuid/checkin records a patient visit', () => {
    return agent.post(`/patients/${patientUuid}/checkin`)
      .then(function (result) {
        expect(result).to.have.status(201);
        expect(result.body).to.have.keys('uuid');
      });
  });


  it('GET patients/:uuid/invoices/latest :The latest bill should show the most recent bill of a patient', () => {
    const LIMIT = 1;
    return agent.get(`/patients/${debtorUuid}/invoices/latest`)
      .then(function (result) {
        expect(result).to.have.status(200);

        expect(result.body[0]).to.have.keys('uid', 'reference', 'credit', 'debit', 'balance', 'entity_uuid', 'uuid', 'debtor_uuid', 'user', 'date', 'cost', 'numberPayment');
      })
      .catch(helpers.api.help);
  });

});
