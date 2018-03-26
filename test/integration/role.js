/* global expect, chai, agent */

const helpers = require('./helpers');

/*
 * The /roles API endpoint
 *
 * This test suite implements full CRUD on the /projects HTTP API endpoint.
 */
describe('(/roles) The roles API endpoint', () => {
  // project we will add during this test suite.
  const roles = {
    label : 'Receptionniste',
    project_id : 1,
  };
  const adminUuid = '5b7dd0d6-9273-4955-a703-126fbd504b61';
  const roleAdmin = {
    label : 'Administrator',
  };
  const userRole = {
    user_id : 2,
    role_uuids : adminUuid,
  };

  it('GET /roles returns a list of roles', () => {
    return agent.get('/roles')
      .query(roles)
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
      })
      .catch(helpers.handler);
  });

  it('POST /roles add a new role', () => {
    return agent.post('/roles')
      .send(roles)
      .then((res) => {
        expect(res).to.have.status(201);
      })
      .catch(helpers.handler);
  });


  it('PUT /roles update admin role\'s label', () => {
    return agent.put('/roles/'.concat(adminUuid))
      .send(roleAdmin)
      .then((res) => {
        expect(res).to.have.status(200);
      })
      .catch(helpers.handler);
  });


  it('POST /roles/assignTouser assingning role to a user', () => {
    return agent.post('/roles/assignTouser')
      .send(userRole)
      .then((res) => {
        expect(res).to.have.status(201);
      })
      .catch(helpers.handler);
  });
});
