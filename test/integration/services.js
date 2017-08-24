/* global expect, chai, agent */

const helpers = require('./helpers');

describe('(/services) The Service API', () => {
  var newService = {
    enterprise_id : 1,
    name : 'tested Service',
    cost_center_id : 2,
    profit_center_id : 1,
  };

  var serviceWithoutCostCenter = {
    name : 'without cost and profit center',
    enterprise_id : 1,
    cost_center_id : null,
    profit_center_id : null,
  };

  var wrongUpdateService = {
    cost_center_id : null,
    profit_center_id : 'wrong value',
  };

  var undefinedProfitService = {
    cost_center_id : null,
    profit_center_id : undefined,
  };

  var responseKeys = [
    'id', 'cost_center_id', 'profit_center_id', 'name', 'enterprise_id',
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

  it('POST /services adds a services with a null cost center', () => {
    return agent.post('/services')
      .send(serviceWithoutCostCenter)
      .then((res) => {
        helpers.api.created(res);
        serviceWithoutCostCenter.id = res.body.id;
        return agent.get(`/services/${serviceWithoutCostCenter.id}`);
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
        helpers.api.listed(res, 5);
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
    var updateInfo = { name : 'other' };
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

  it('PUT /services/:id refuses to update a service with a string as profit_center_id', () => {
    return agent.put(`/services/${newService.id}`)
      .send(wrongUpdateService)
      .then((res) => {
        helpers.api.errored(res, 400);
      })
      .catch(helpers.handler);
  });

  it('PUT /services/:id ignores an undefined profit center and update a service with defined properties', () => {
    return agent.put(`/services/${newService.id}`)
      .send(undefinedProfitService)
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.id).to.equal(newService.id);
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

  it('DELETE /services/:id should return a 404 for unknown service', () => {
    return agent.delete('/services/unknown')
      .then((res) => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });
});
