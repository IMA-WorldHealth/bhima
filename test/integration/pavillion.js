/* global expect, agent */

const helpers = require('./helpers');

/*
 * The /pavillions API endpoint
 *
 * This test suite implements full CRUD on the /projects HTTP API endpoint.
 */
describe('(/pavillions) The pavillion API endpoint', () => {
  // project we will add during this test suite.
  const uuid = '5b7dd0d6-9273-4955-a703-126fbd504b61';
  const uuid2 = '7b7dd0d6-9273-4955-a703-126fbd504b61';

  const pavillion = {
    uuid,
    name : 'pavillion 1',
    description : 'Frist pavillion',
  };

  const pavillion2 = {
    uuid : uuid2,
    name : 'pavillion 2',
    description : 'Second pavillion',
  };

  const pavillionUpdate = {
    uuid,
    name : 'pavillion A',
  };

  it('POST /pavillions add a new pavillion', () => {
    return agent.post('/pavillions')
      .send(pavillion)
      .then((res) => {
        expect(res).to.have.status(201);
      })
      .catch(helpers.handler);
  });

  it('POST /pavillions add pavillion not linked to a service', () => {
    return agent.post('/pavillions')
      .send(pavillion2)
      .then((res) => {
        expect(res).to.have.status(201);
      })
      .catch(helpers.handler);
  });

  it('GET /pavillions returns a list of pavillions', () => {
    return agent.get('/pavillions')
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.length(2);
      })
      .catch(helpers.handler);
  });

  it('PUT /pavillions update a pavillion', () => {
    return agent.put(`/pavillions/${uuid}`)
      .send(pavillionUpdate)
      .then((res) => {
        expect(res).to.have.status(200);
        return agent.get(`/pavillions/${uuid}`);
      })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.name).to.equal(pavillionUpdate.name);
      })
      .catch(helpers.handler);

  });

  it('DELETE /pavillions should delete an existing pavillion', () => {
    return agent.delete(`/pavillions/${uuid2}`)
      .then((res) => {
        helpers.api.deleted(res);
        return agent.get(`/pavillions`);
      })
      .then(res => {
        expect(res.body).to.be.length(1);
      })
      .catch(helpers.handler);
  });

});
