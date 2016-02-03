/* global describe, it, beforeEach */

var chai = require('chai');
var expect = chai.expect;

var helpers = require('./helpers');
helpers.configure(chai);

describe('The Service API, PATH : /services', function () {
  var agent = chai.request.agent(helpers.baseUrl);

  var newService = {
    enterprise_id : 1,
    name : 'tested Service',
    cost_center_id : 1,
    profit_center_id : 1
  };

  var responseKeys = [
    'id', 'cost_center_id', 'profit_center_id', 'name', 'enterprise_id'
  ];

  beforeEach(helpers.login(agent));

  it('METHOD : POST, PATH : /services, It adds a services', function () {
    return agent.post('/services')
      .send(newService)
      .then(function (res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body.id).to.be.defined;
        newService.id = res.body.id;
        return agent.get('/services/' + newService.id);
      })
      .then(function (res){
        expect(res).to.have.status(200);
        expect(res.body).to.have.all.keys(responseKeys);
      })
     .catch(helpers.handler);
  });

  it('METHOD : GET, PATH : /services, It returns a list of services', function () {
      return agent.get('/services')
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.not.be.empty;
          expect(res.body).to.have.length(4);
        })
        .catch(helpers.handler);
    });

  it('METHOD : GET, PATH : /services/:id, It returns one services', function () {
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


  it('METHOD : PUT, PATH : /services/:id, It updates the newly added services', function () {
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

   it('METHOD : DELETE, PATH : /services/:id, It deletes a service', function () {
    return agent.delete('/services/' + newService.id)
      .then(function (res) {
        expect(res).to.have.status(204);
        // re-query the database
        return agent.get('/services/' + newService.id);
      })
      .then(function (res) {
        expect(res).to.have.status(404);
        expect(res.body).to.contain.all.keys(helpers.errorKeys);
      })
      .catch(helpers.handler);
  });
});
