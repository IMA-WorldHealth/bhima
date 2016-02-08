/* global describe, it, beforeEach */

var chai = require('chai');
var expect = chai.expect;

var helpers = require('./helpers');
helpers.configure(chai);

describe('The cost center API, PATH : /cost_centers', function () {
 var agent = chai.request.agent(helpers.baseUrl);

 var newCostCenter = {
    project_id : 1,
    text : 'tested cost',
    note : 'test inserted',
    is_principal : 1
  };

  var DELETABLE_COST_CENTER_ID = 2;
  var FETCHABLE_COST_CENTER_ID = 1;

   // throw errors
  beforeEach(helpers.login(agent));

    it('METHOD : GET, PATH : /cost_centers?full=1, It returns a full list of cost centers', function () {
      return agent.get('/cost_centers?full=1')
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.not.be.empty;
          expect(res.body).to.have.length(2);
        })
       .catch(helpers.handler);
    });

    it('METHOD : GET, PATH : /cost_centers?available=1, It returns a list of availables cost centers', function () {
      return agent.get('/cost_centers?available=1')
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.not.be.empty;
          expect(res.body).to.have.length(1);
        })
       .catch(helpers.handler);
    });

    it('METHOD : GET, PATH : /cost_centers?available=1&full=1, It returns a full list of availables cost centers', function () {
      return agent.get('/cost_centers?available=1&full=1')
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.not.be.empty;
          expect(res.body).to.have.length(1);
        })
       .catch(helpers.handler);
    });

    it('METHOD : GET, PATH : /cost_centers, It returns a list of cost centers', function () {
      return agent.get('/cost_centers')
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.not.be.empty;
          expect(res.body).to.have.length(2);
        })
        .catch(helpers.handler);
    });

  it('METHOD : GET, PATH : /cost_center/:id, It returns one cost center', function () {
    return agent.get('/cost_centers/'+ FETCHABLE_COST_CENTER_ID)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body.id).to.be.equal(FETCHABLE_COST_CENTER_ID);
        expect(res.body).to.have.all.keys('project_id', 'id', 'text', 'note', 'is_principal');
      })
      .catch(helpers.handler);
  });

  it('METHOD : GET, PATH : /cost_centers/:id/cost, It returns the cost of a provided cost center', function () {
    return agent.get('/cost_centers/:id/cost'.replace(':id', FETCHABLE_COST_CENTER_ID))
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body).to.have.all.keys('cost');
        expect(res.body.cost).to.satisfy(function (cost) { return cost >= 0;});
      })
      .catch(helpers.handler);
  });

  it('METHOD : POST, PATH : /cost_centers, It adds a cost center', function () {
    return agent.post('/cost_centers')
      .send(newCostCenter)
      .then(function (res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body.id).to.be.defined;
        newCostCenter.id = res.body.id;

        return agent.get('/cost_centers/' + newCostCenter.id);
      })
      .then(function (res){
        expect(res).to.have.status(200);
        expect(res.body).to.have.all.keys('project_id', 'id', 'text', 'note', 'is_principal');
      })
      .catch(helpers.handler);
  });

  it('METHOD : PUT, PATH : /cost_centers/:id, It updates the newly added cost center', function () {
    var updateInfo = {note : 'update value for note'};

    return agent.put('/cost_centers/'+ newCostCenter.id)
      .send(updateInfo)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.id).to.equal(newCostCenter.id);
        expect(res.body.note).to.equal(updateInfo.note);
      })
      .catch(helpers.handler);
  });

   it('METHOD : DELETE, PATH : /cost_centers/:id, It deletes a cost_center', function () {

    return agent.delete('/cost_centers/' + DELETABLE_COST_CENTER_ID)
      .then(function (res) {
        expect(res).to.have.status(204);
        // re-query the database
        return agent.get('/cost_centers/' + DELETABLE_COST_CENTER_ID);
      })
      .then(function (res) {
        expect(res).to.have.status(404);
      })
      .catch(helpers.handler);
  });
});
