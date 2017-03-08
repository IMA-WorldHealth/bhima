/* global expect, chai, agent */

const helpers = require('./helpers');

describe('(/services) The Service API', function () {

  let newService = {
    enterprise_id : 1,
    name : 'tested Service',
    fc_id : 2
  };
  let serviceWithoutFeeCenter = {
    name : 'without fee and profit center',
    enterprise_id : 1,
    fc_id : null
  };
  let unknownService = {name : 'unkwon name'};
  let responseKeys = [
    'id', 'fc_id', 'name', 'enterprise_id'
  ];

  it('POST /services adds a services', function () {
    return agent.post('/services')
      .send(newService)
      .then(function (res) {
        helpers.api.created(res);
        newService.id = res.body.id;
        return agent.get('/services/' + newService.id);
      })
      .then(function (res){
        expect(res).to.have.status(200);
        expect(res.body).to.have.all.keys(responseKeys);
      })
     .catch(helpers.handler);
  });

  it('POST /services adds a services with a null fee center', function () {
    return agent.post('/services')
      .send(serviceWithoutFeeCenter)
      .then(function (res) {
        helpers.api.created(res);
        serviceWithoutFeeCenter.id = res.body.id;
        return agent.get('/services/' + serviceWithoutFeeCenter.id);
      })
      .then(function (res){
        expect(res).to.have.status(200);
        expect(res.body).to.have.all.keys(responseKeys);
      })
     .catch(helpers.handler);
  });

  it('GET /services returns a list of services', function () {
      return agent.get('/services')
        .then(function (res) {
          helpers.api.listed(res, 5);
        })
        .catch(helpers.handler);
  });

  it('GET /services/:id returns one services', function () {
    return agent.get('/services/'+ newService.id)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body.id).to.be.equal(newService.id);
        expect(res.body).to.have.all.keys(responseKeys);
      })
      .catch(helpers.handler);
  });

  it('PUT /services/:id updates the newly added services', function () {
    var updateInfo = {name : 'other'};
    return agent.put('/services/'+ newService.id)
      .send(updateInfo)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.id).to.equal(newService.id);
        expect(res.body.name).to.equal(updateInfo.name);
      })
      .catch(helpers.handler);
  });

  it('PUT /services/:id refuses to update an unknown service', function () {
    return agent.put('/services/unknown')
      .send(unknownService)
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('DELETE /services/:id deletes a service', function () {
    return agent.delete('/services/' + newService.id)
      .then(function (res) {
        helpers.api.deleted(res);
        return agent.get('/services/' + newService.id);
      })
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('DELETE /services/:id should return a 404 for unknown service', function () {
    return agent.delete('/services/unknown')
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });
});
