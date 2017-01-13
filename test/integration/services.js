/* global expect, chai, agent */
/* jshint expr : true */

const helpers = require('./helpers');

describe('(/services) The Service API', function () {

  var newService = {
    enterprise_id : 1,
    name : 'tested Service',
    cc_id : 1,
    pc_id : 7
  };

  var serviceWithoutCostCenter = {
    name : 'without cost and profit center',
    enterprise_id : 1,
    cc_id : null,
    pc_id : null
  };

  var wrongUpdateService = {
    cc_id : null,
    pc_id : 'wrong value'
  };

  var undefinedProfitService = {
    cc_id : null,
    pc_id : undefined
  };

  var responseKeys = [
    'id', 'cc_id', 'pc_id', 'name', 'enterprise_id'
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

  it('POST /services adds a services with a null cost center', function () {
    return agent.post('/services')
      .send(serviceWithoutCostCenter)
      .then(function (res) {
        helpers.api.created(res);
        serviceWithoutCostCenter.id = res.body.id;
        return agent.get('/services/' + serviceWithoutCostCenter.id);
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


  it('PUT /services/:id refuses to update a service with a string as profit_center_id', function () {
    return agent.put('/services/' + newService.id)
      .send(wrongUpdateService)
      .then(function (res) {
        helpers.api.errored(res, 400);
      })
      .catch(helpers.handler);
  });

  it('PUT /services/:id ignores an undefined profit center and update a service with defined properties', function () {
  return agent.put('/services/' + newService.id)
    .send(undefinedProfitService)
    .then(function (res) {
      expect(res).to.have.status(200);
      expect(res).to.be.json;
      expect(res.body.id).to.equal(newService.id);
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
