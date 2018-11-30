/* global expect, chai, agent */

const helpers = require('./helpers');

/*
 * The /pavions API endpoint
 *
 * This test suite implements full CRUD on the /projects HTTP API endpoint.
 */
describe('(/pavions) The pavion API endpoint', () => {
  // project we will add during this test suite.
  const uuid = '5b7dd0d6-9273-4955-a703-126fbd504b61';
  const uuid2 = '7b7dd0d6-9273-4955-a703-126fbd504b61';

  const pavion = {
    uuid,
    name : 'Pavion 1',
    description : 'Frist pavion',
    project_id : 1,
    service_id : 1,
  };

  const pavion2 = {
    uuid : uuid2,
    name : 'Pavion 2',
    description : 'Second pavion',
    project_id : 1,
  };

  const pavionUpdate = {
    uuid,
    name : 'Pavion A',
  };

  it('POST /pavions add a new pavion', () => {
    return agent.post('/pavions')
      .send(pavion)
      .then((res) => {
        expect(res).to.have.status(201);
      })
      .catch(helpers.handler);
  });

  it('POST /pavions add pavion not linked to a service', () => {
    return agent.post('/pavions')
      .send(pavion2)
      .then((res) => {
        expect(res).to.have.status(201);
      })
      .catch(helpers.handler);
  });

  it('GET /pavions returns a list of pavions', () => {
    return agent.get('/pavions')
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(res.body).to.be.length(2);
      })
      .catch(helpers.handler);
  });

  it('PUT /pavions update a pavion', () => {
    return agent.put(`/pavions/${uuid}`)
      .send(pavionUpdate)
      .then((res) => {
        expect(res).to.have.status(200);
        return agent.get(`/pavions/${uuid}`);
      })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.name).to.equal(pavionUpdate.name);
      })
      .catch(helpers.handler);

  });

  it('DELETE /pavions should delete an existing pavion', () => {
    return agent.delete(`/pavions/${uuid2}`)
      .then((res) => {
        helpers.api.deleted(res);
        return agent.get(`/pavions`)
      })
      .then(res => {
        expect(res.body).to.be.length(1);
      })
      .catch(helpers.handler);
  });

});
