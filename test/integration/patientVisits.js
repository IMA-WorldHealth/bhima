/* global expect, chai, agent */
/* jshint expr : true */

const helpers = require('./helpers');

describe('(/patients/:uuid/visits) Patient Visits', () => {

  const patientUuid = '81af634f-321a-40de-bc6f-ceb1167a9f65';
  const BASE_VISITS = 1;

  const KEYS = [
    'patient_uuid', 'uuid', 'start_date', 'end_date', 'start_notes',
    'end_notes', 'start_diagnosis_id', 'end_diagnosis_id', 'is_open',
    'user_id', 'username'
  ];

  it('GET /patients/:uuid/visits returns a list of all patient visits', () => {
    return agent.get(`/patients/${patientUuid}/visits`)
      .then(function (res) {
        helpers.api.listed(res, BASE_VISITS);
        expect(res.body[0]).to.have.keys(KEYS);
      })
      .catch(helpers.api.handler);
  });


  it('GET /patients/:uuid/visits?limit={N} limits the results', () => {
    const LIMIT = 1;
    return agent.get(`/patients/${patientUuid}/visits`)
      .query({ limit : LIMIT })
      .then(function (res) {
        helpers.api.listed(res, 1);
        expect(res.body[0]).to.have.keys(KEYS);
      })
      .catch(helpers.api.handler);
  });

  // this will cache the last visit uuid
  let lastVisitUuid;

  const visitOptions = {
    start_date : new Date(),
    start_notes : 'This was the start',
    start_diagnosis_id : 1234,
    user_id : 1
  };

  it('POST /patients/:uuid/visits/admission starts a new patient visit', () => {
    return agent.post(`/patients/${patientUuid}/visits/admission`)
      .send(visitOptions)
      .then(function (res) {
        helpers.api.created(res);

        // cache the uuid
        lastVisitUuid = res.body.uuid;
        visitOptions.uuid = lastVisitUuid;

        return agent.get(`/patients/${patientUuid}/visits/`);
      })
      .then(function (res) {
        helpers.api.listed(res, BASE_VISITS + 1);
      })
      .catch(helpers.api.handler);
  });

  it('GET /patients/:uuid/visits/:uuid will return a visit by the uuid', () => {
    return agent.get(`/patients/${patientUuid}/visits/${lastVisitUuid}`)
      .then(function (res) {
        expect(res).to.have.status(200);

        expect(res.body).to.have.keys(KEYS);

        expect(res.body.uuid).to.equal(lastVisitUuid);
        expect(res.body.start_notes).to.equal(visitOptions.start_notes);
        expect(res.body.is_open).to.equal(1);
      })
      .catch(helpers.api.handler);
  });

  it('GET /patients/visits/:uuid will also return a visit by the uuid', () => {
    return agent.get(`/patients/visits/${lastVisitUuid}`)
      .then(function (res) {
        expect(res).to.have.status(200);

        expect(res.body).to.have.keys(KEYS);

        expect(res.body.uuid).to.equal(lastVisitUuid);
        expect(res.body.start_notes).to.equal(visitOptions.start_notes);
        expect(res.body.is_open).to.equal(1);
      })
      .catch(helpers.api.handler);
  });

  // synonym for limit = 1, but returns a JSON object instead of an ARRAY
  it('GET /patients/:uuid/visits?last=1 will return the last patient visit', () => {
    return agent.get(`/patients/${patientUuid}/visits`)
      .query({ last : 1 })
      .then(function (res) {
        expect(res).to.have.status(200);

        expect(res.body).to.have.keys(KEYS);

        expect(res.body.uuid).to.equal(lastVisitUuid);
        expect(res.body.start_notes).to.equal(visitOptions.start_notes);
        expect(res.body.is_open).to.equal(1);
      })
      .catch(helpers.api.handler);
  });


  it('GET /patients/visits?is_open=1 should find all open patient visits', () => {
    const NUM_MATCHES = 1;
    const qs = { is_open : 1 };
    return agent.get('/patients/visits')
      .query(qs)
      .then(function (res) {
        helpers.api.listed(res, NUM_MATCHES);
      })
      .catch(helpers.api.handler);
  });

  it('POST /patients/:uuid/visits/discharge ends a new patient visit', () => {
    const payload = { uuid : lastVisitUuid, end_date : new Date(), end_notes: 'This was the end', end_diagnosis_id : 1234 };
    return agent.post(`/patients/${patientUuid}/visits/discharge`)
      .send(payload)
      .then(function (res) {
        helpers.api.created(res);
        return agent.get(`/patients/${patientUuid}/visits/${lastVisitUuid}`);
      })
      .then(function (res) {
        expect(res).to.have.status(200);

        expect(res.body).to.have.keys(KEYS);

        // make sure this values are correct
        expect(res.body.uuid).to.equal(lastVisitUuid);
        expect(res.body.start_notes).to.equal(visitOptions.start_notes);
        expect(res.body.end_notes).to.equal(payload.end_notes);
        expect(res.body.is_open).to.equal(0);
      })
      .catch(helpers.api.handler);
  });

  it('GET /patients/visits?diagnosis_id={id} should find all diagnosis with a given ID', () => {
    const NUM_MATCHES = 1;
    const qs = { diagnosis_id : 1234 };
    return agent.get('/patients/visits')
      .query(qs)
      .then(function (res) {
        helpers.api.listed(res, NUM_MATCHES);
      })
      .catch(helpers.api.handler);
  });
});
