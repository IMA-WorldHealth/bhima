/* global expect, agent */
/* eslint-disable no-unused-expressions */

const helpers = require('./helpers');

/*
 * The /departments API endpoint
 *
 * This test suite implements full CRUD on the /projects HTTP API endpoint.
 */
describe('(/departments) The department API endpoint', () => {
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

  it('POST /departments add a new department', () => {
    return agent.post('/departments')
      .send(department)
      .then((res) => {
        expect(res).to.have.status(201);
      })
      .catch(helpers.handler);
  });

  it('POST /departments add another department', () => {
    return agent.post('/departments')
      .send(department2)
      .then((res) => {
        expect(res).to.have.status(201);
      })
      .catch(helpers.handler);
  });

  it('GET /departments returns a list of departments', () => {
    return agent.get('/departments')
      .query(params)
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(res.body).to.be.length(2);
      })
      .catch(helpers.handler);
  });

  it('PUT /departments update a department', () => {
    return agent.put(`/departments/${uuid}`)
      .send(departmentUpdate)
      .then((res) => {
        expect(res).to.have.status(200);
        return agent.get(`/departments/${uuid}`);
      })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.name).to.equal(departmentUpdate.name);
      })
      .catch(helpers.handler);

  });

  it('DELETE /departments should delete an existing department', () => {
    return agent.delete(`/departments/${uuid2}`)
      .then((res) => {
        helpers.api.deleted(res);
        return agent.get(`/departments`).query(params);
      })
      .then(res => {
        expect(res.body).to.be.length(1);
      })
      .catch(helpers.handler);
  });

});
