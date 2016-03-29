/* jshint expr:true */
var chai = require('chai');
var expect = chai.expect;

var helpers = require('./helpers');
helpers.configure(chai);

/**
 * @todo - there are some tests missing:
 *  - invalid POSTs
 *  - 404s on PUTs
 */
describe('(/cost_centers) The cost center API', function () {
 var agent = chai.request.agent(helpers.baseUrl);

 var newCostCenter = {
    project_id : 1,
    text : 'tested cost',
    note : 'test inserted',
    is_principal : 1
  };

  var DELETABLE_COST_CENTER_ID = 2;
  var FETCHABLE_COST_CENTER_ID = 1;

  var responseKeys = [
    'project_id', 'id', 'text', 'note', 'is_principal'
  ];

  // ensure that the client is logged in before tests start
  before(helpers.login(agent));

  it('GET /cost_centers returns a list of cost centers', function () {
    return agent.get('/cost_centers')
      .then(function (res) {
        helpers.api.listed(res, 2);
      })
      .catch(helpers.handler);
  });

  /** @todo - make this route ?detailed=1 to conform to standards */
  it('GET /cost_centers?full=1 returns a full list of cost centers', function () {
    return agent.get('/cost_centers?full=1')
      .then(function (res) {
        helpers.api.listed(res, 2);
      })
     .catch(helpers.handler);
  });

  it('GET /cost_centers?available=1 returns a list of availables cost centers', function () {
    return agent.get('/cost_centers?available=1')
      .then(function (res) {
        helpers.api.listed(res, 1);
      })
     .catch(helpers.handler);
  });

  it('GET /cost_centers?available=1&full=1 returns a full list of availables cost centers', function () {
    return agent.get('/cost_centers?available=1&full=1')
      .then(function (res) {
        helpers.api.listed(res, 1);
      })
     .catch(helpers.handler);
  });

  it('GET /cost_center/:id returns one cost center', function () {
    return agent.get('/cost_centers/'+ FETCHABLE_COST_CENTER_ID)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body.id).to.be.equal(FETCHABLE_COST_CENTER_ID);
        expect(res.body).to.have.all.keys(responseKeys);
      })
      .catch(helpers.handler);
  });

  it('GET /cost_center/:id returns a 404 for an unknown cost center id', function () {
    return agent.get('/cost_centers/unknown')
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  /** @todo - should this return a simple number? */
  it('GET /cost_centers/:id/cost returns the cost of a provided cost center', function () {
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

  it('POST /cost_centers adds a cost center', function () {
    return agent.post('/cost_centers')
      .send(newCostCenter)
      .then(function (res) {
        helpers.api.created(res);
        newCostCenter.id = res.body.id;
        return agent.get('/cost_centers/' + newCostCenter.id);
      })
      .then(function (res){
        expect(res).to.have.status(200);
        expect(res.body).to.have.all.keys(responseKeys);
      })
      .catch(helpers.handler);
  });

  it('PUT /cost_centers/:id updates the newly added cost center', function () {
    var updateInfo = { note : 'update value for note' };
    return agent.put('/cost_centers/' + newCostCenter.id)
      .send(updateInfo)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.id).to.equal(newCostCenter.id);
        expect(res.body.note).to.equal(updateInfo.note);
      })
      .catch(helpers.handler);
  });

  it('DELETE /cost_centers/:id deletes a cost_center', function () {
    return agent.delete('/cost_centers/' + DELETABLE_COST_CENTER_ID)
      .then(function (res) {
        helpers.api.deleted(res);
        return agent.get('/cost_centers/' + DELETABLE_COST_CENTER_ID);
      })
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('DELETE /cost_centers/:id returns a 404 for an unknown cost center id', function () {
    return agent.delete('/cost_centers/unknown')
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });
});
