/* eslint no-unused-expressions:off */
/* global expect, agent */

const helpers = require('./helpers');

/*
 * The /roles API endpoint
 *
 * This test suite implements full CRUD on the /roles HTTP API endpoint.
 */
describe('(/indicators) The roles API endpoint', () => {

  const hospUuid = 'A6F9527BA7B44A2C9F4FDD7323BBCF72';
  const hospUuid2 = '13014ac9457411e9ae4d54e1ad68cdc0';

  const newIndicator = {
    indicator : {
      uuid : 'fd48517c457311e9ae4d54e1ad68cdc0',
      status_id : 1,
      period_id : 201901,
      type : 'hospitalization',
    },
    hospitalization : {
      uuid : hospUuid,
      PatientsDied : 10,
      daysOfHospitalization : 10,
      service_id : 3,
    },
  };

  const newIndicator2 = {
    indicator : {
      uuid : hospUuid2,
      status_id : 2,
      period_id : 201902,
      type : 'hospitalization',
    },
    hospitalization : {
      uuid : hospUuid2,
      PatientsDied : 40,
      daysOfHospitalization : 45,
      service_id : 3,
    },
  };

  const IndicatorUpdate = {
    indicator : {
      status_id : 2,
    },
    hospitalization : {
      uuid : hospUuid,
      PatientsDied : 13,
      daysOfHospitalization : 5,
      indicator_uuid : newIndicator.indicator.uuid,
    },
  };


  it('GET /indicators returns a list of insdicators (should be empty)', () => {
    return agent.get('/indicators')
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.length(0);
      })
      .catch(helpers.handler);
  });

  it('POST /indicators/hospitalization add a new indicator', () => {
    return agent.post('/indicators/hospitalization')
      .send(newIndicator)
      .then(res => {
        expect(res).to.have.status(201);
      })
      .catch(helpers.handler);
  });

  it('POST /indicators/hospitalization add another indicator', () => {
    return agent.post('/indicators/hospitalization')
      .send(newIndicator2)
      .then(res => {
        expect(res).to.have.status(201);
      })
      .catch(helpers.handler);
  });

  it('GET /indicators returns a list of insdicators (2 added indicators)', () => {
    return agent.get('/indicators')
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.length(2);
      })
      .catch(helpers.handler);
  });


  it('PUT /indicators/hospitalization/:uuid update an existing indicator', () => {
    return agent.put(`/indicators/hospitalization/${hospUuid}`)
      .send(IndicatorUpdate)
      .then(res => {
        expect(res).to.have.status(200);
      })
      .catch(helpers.handler);
  });


  it('DELETE /indicators/hospitalization/:uuid delete an indicator', () => {
    return agent.delete(`/indicators/hospitalization/${hospUuid2}`)
      .send(IndicatorUpdate)
      .then(res => {
        expect(res).to.have.status(200);
      })
      .catch(helpers.handler);
  });

});
