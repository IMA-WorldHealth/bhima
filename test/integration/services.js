/* global expect, agent */
/* eslint-disable no-unused-expressions */

const helpers = require('./helpers');

describe('(/services) The Service API', () => {
  const newService = {
    enterprise_id : 1,
    name : 'tested Service',
    project_id : 1,
  };

  const responseKeys = [
    'id', 'name', 'enterprise_id', 'hidden', 'project_id', 'project_name',
  ];

  it('POST /services adds a services', () => {
    return agent.post('/services')
      .send(newService)
      .then((res) => {
        helpers.api.created(res);
        newService.id = res.body.id;
        return agent.get(`/services/${newService.id}`);
      })
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.all.keys(responseKeys);
      })
      .catch(helpers.handler);
  });

  it('GET /services returns a list of services', () => {
    return agent.get('/services')
      .then((res) => {
        helpers.api.listed(res, 4);
      })
      .catch(helpers.handler);
  });

  it('GET /services/:id returns one services', () => {
    return agent.get(`/services/${newService.id}`)
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body.id).to.be.equal(newService.id);
        expect(res.body).to.have.all.keys(responseKeys);
      })
      .catch(helpers.handler);
  });

  it('PUT /services/:id updates the newly added services', () => {
    const updateInfo = { name : 'other' };
    return agent.put(`/services/${newService.id}`)
      .send(updateInfo)
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.id).to.equal(newService.id);
        expect(res.body.name).to.equal(updateInfo.name);
      })
      .catch(helpers.handler);
  });

  it('DELETE /services/:id deletes a service', () => {
    return agent.delete(`/services/${newService.id}`)
      .then((res) => {
        helpers.api.deleted(res);
        return agent.get(`/services/${newService.id}`);
      })
      .then((res) => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('DELETE /services/:id will send back a 404 if the services id does not exist', () => {
    return agent.delete('/services/123456789')
      .then((res) => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('DELETE /services/:id will send back a 404 if the services id is a string', () => {
    return agent.delete('/services/str')
      .then((res) => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });
});
