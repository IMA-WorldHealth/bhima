/* global expect, chai, agent */

const helpers = require('./helpers');

/*
 * The /department API endpoint
 *
 * This test suite implements full CRUD on the /projects HTTP API endpoint.
 */
describe('(/department) The department API endpoint', () => {
  // project we will add during this test suite.
  const uuid = '5b7dd0d6-9273-4955-a703-126fbd504b61';
  const uuid2 = '7b7dd0d6-9273-4955-a703-126fbd504b61';
  const department = {
    uuid,
    name : 'HR',
    enterprise_id : 1,
  };
  const department2 = {
    uuid : uuid2,
    name : 'Computer Science',
    enterprise_id : 1,
  };

  const departmentUpdate = {
    uuid,
    name : 'Human Ressource',
    enterprise_id : 1,
  };

  const params = {
    enterprise_id : 1,
  };

  it('POST /department add a new department', () => {
    return agent.post('/department')
      .send(department)
      .then((res) => {
        expect(res).to.have.status(201);
      })
      .catch(helpers.handler);
  });

  it('POST /department add another department', () => {
    return agent.post('/department')
      .send(department2)
      .then((res) => {
        expect(res).to.have.status(201);
      })
      .catch(helpers.handler);
  });

  it('GET /department returns a list of departments', () => {
    return agent.get('/department')
      .query(params)
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
      })
      .catch(helpers.handler);
  });

  it('PUT /department update a department', () => {
    return agent.put(`/department/${uuid}`)
      .send(departmentUpdate)
      .then((res) => {
        expect(res).to.have.status(200);
      })
      .catch(helpers.handler);
  });

  it('DELETE /department should delete an existing department', () => {
    return agent.delete(`/department/${uuid2}`)
      .then((res) => {
        helpers.api.deleted(res);
      })
      .catch(helpers.handler);
  });

});
