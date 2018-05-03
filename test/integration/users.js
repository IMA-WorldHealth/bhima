/* global expect, agent */

const helpers = require('./helpers');

/*
 * The /users API endpoint
 *
 * This test suite implements full CRUD on the /users HTTP API endpoint.
 */
describe('(/users) Users and Permissions', () => {
  const newUser = {
    username      : 'newUser',
    password      : 'newUser',
    projects      : [1],
    email         : 'newUser@test.org',
    first         : 'new',
    last          : 'user',
    display_name  : 'New Utilisateur',
  };

  const badUser = {
    username : 'username',
    password : 'password',
  };

  const depots = [
    'f9caeb16-1684-43c5-a6c4-47dbac1df296',
    'd4bb1452-e4fa-4742-a281-814140246877',
  ];

  const cashboxes = [1, 2];

  it('GET /users returns a list of users', () => {
    return agent.get('/users')
      .then(res => {
        helpers.api.listed(res, 4);
      })
      .catch(helpers.handler);
  });

  it('POST /users will add a valid user', () => {
    return agent.post('/users')
      .send(newUser)
      .then(res => {
        helpers.api.created(res);

        // cache the user id
        newUser.id = res.body.id;
      })
      .catch(helpers.handler);
  });

  it('POST /users will reject an invalid user', () => {
    return agent.post('/users')
      .send(badUser)
      .then(res => {
        helpers.api.errored(res, 400, 'ERRORS.ER_BAD_NULL_ERROR');
      })
      .catch(helpers.handler);
  });

  it('POST /users with empty object will send 400 error code', () => {
    return agent.post('/users')
      .send({})
      .then(res => {
        helpers.api.errored(res, 400);
      })
      .catch(helpers.handler);
  });

  it('GET /users/:id/projects should not find one project assigned to the new user', () => {
    return agent.get(`/users/${newUser.id}/projects`)
      .then(res => {
        helpers.api.listed(res, 1);
      })
      .catch(helpers.handler);
  });

  it('GET /users/:id will find the newly added user', () => {
    return agent.get(`/users/${newUser.id}`)
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.email).to.equal(newUser.email);
        expect(res.body.display_name).to.equal(newUser.display_name);
      })
      .catch(helpers.handler);
  });

  it('PUT /users/:id will update the newly added user', () => {
    return agent.put(`/users/${newUser.id}`)
      .send({ email : 'email@test.org' })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.username).to.equal(newUser.username);
        expect(res.body.email).to.not.equal(newUser.email);

        // re-query the database
        return agent.get(`/users/${newUser.id}`);
      })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.email).to.equal('email@test.org');
      })
      .catch(helpers.handler);
  });

  it('PUT /users/:id will update a user\'s projects', () => {
    return agent.put(`/users/${newUser.id}`)
      .send({ projects : [1, 2] })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.username).to.equal(newUser.username);
        expect(res.body.projects).to.deep.equal([1, 2]);

        // re-query the database
        return agent.get(`/users/${newUser.id}`);
      })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body.email).to.equal('email@test.org');
      })
      .catch(helpers.handler);
  });

  it('PUT /users/:id will NOT update the new user\'s password', () => {
    return agent.put(`/users/${newUser.id}`)
      .send({ password : 'I am super secret.' })
      .then(res => {
        helpers.api.errored(res, 400);
        expect(res.body.code).to.equal('ERRORS.PROTECTED_FIELD');
      })
      .catch(helpers.handler);
  });

  it('PUT /users/:id/password will update the new user\'s password', () => {
    return agent.put(`/users/${newUser.id}/password`)
      .send({ password : 'I am super secret.' })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
      })
      .catch(helpers.handler);
  });

  it('GET /users/:id/permissions will have empty permissions for new user', () => {
    return agent.get(`/users/${newUser.id}/permissions`)
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.empty;
      })
      .catch(helpers.handler);
  });

  it('POST /users/:id/permissions will create user permissions', () => {
    return agent.post(`/users/${newUser.id}/permissions`)
      .send({ permissions : [0] }) // just the root node
      .then(res => {
        expect(res).to.have.status(201);
        return agent.get(`/users/${newUser.id}/permissions`);
      })
      .then(res => {
        helpers.api.listed(res, 1);

        expect(res.body[0]).to.have.keys('id', 'unit_id');
        expect(res.body[0].unit_id).to.equal(0);
      })
      .catch(helpers.handler);
  });

  // a user is allowed to delete all permissions for a give user.
  it('POST /users/:id/permissions with no permissions will succeed', () => {
    return agent.post(`/users/${newUser.id}/permissions`)
      .send({ permissions : [] })
      .then(res => {
        expect(res).to.have.status(201);
        return agent.get(`/users/${newUser.id}/permissions`);
      })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.empty;
      })
      .catch(helpers.handler);
  });


  it('PUT /users/:id/password will update a user\'s password', () => {
    return agent.put(`/users/${newUser.id}/password`)
      .send({ password : 'WOW' })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
      })
      .catch(helpers.handler);
  });


  it('DELETE /users/:id will not possible to delete the user who have Permissions', () => {
    return agent.delete(`/users/${newUser.id}`)
      .then(res => {
        helpers.api.errored(res, 400);
      })
      .catch(helpers.handler);
  });


  it('GET /users/:id/permissions will be empty for deleted user', () => {
    return agent.get(`/users/${newUser.id}/permissions`)
      .then(res => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.empty;
      })
      .catch(helpers.handler);
  });

  // Add depot permissions for user
  it('POST /users/:id/depots will create user depots', () => {
    return agent.post(`/users/${newUser.id}/depots`)
      .send({ depots }) // just the root node
      .then(res => {
        expect(res).to.have.status(201);
        return agent.get(`/users/${newUser.id}/depots`);
      })
      .then(res => {
        helpers.api.listed(res, 2);
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
      })
      .catch(helpers.handler);
  });

  // Reset depot permissions for user
  it('POST /users/:id/depots will reset user depots', () => {
    return agent.post(`/users/${newUser.id}/depots`)
      .send({ depots : [] })
      .then(res => {
        expect(res).to.have.status(201);
        return agent.get(`/users/${newUser.id}/depots`);
      })
      .then(res => {
        helpers.api.listed(res, 0);
        expect(res).to.have.status(200);
        expect(res.body).to.be.empty;
      })
      .catch(helpers.handler);
  });


  // Add cashbox permissions for user
  it('POST /users/:id/cashboxes will create user cashboxes', () => {
    return agent.post(`/users/${newUser.id}/cashboxes`)
      .send({ cashboxes }) // just the root node
      .then(res => {
        expect(res).to.have.status(201);
        return agent.get(`/users/${newUser.id}/cashboxes`);
      })
      .then(res => {
        helpers.api.listed(res, 2);
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
      })
      .catch(helpers.handler);
  });

  // Reset cashbox permissions for user
  it('POST /users/:id/cashboxes will reset user cashboxes', () => {
    return agent.post(`/users/${newUser.id}/cashboxes`)
      .send({ cashboxes : [] })
      .then(res => {
        expect(res).to.have.status(201);
        return agent.get(`/users/${newUser.id}/cashboxes`);
      })
      .then(res => {
        helpers.api.listed(res, 0);
        expect(res).to.have.status(200);
        expect(res.body).to.be.empty;
      })
      .catch(helpers.handler);
  });
});
