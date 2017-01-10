/* global expect, chai, agent */

const helpers = require('./helpers');

/*
 * @todo - there are some tests missing:
 *  - invalid POSTs
 *  - 404s on PUTs
 */
describe('(/fee_centers) The fee center API', function () {

  const newFeeCenter = {
    project_id : 1,
    label : 'tested fee center',
    is_cost : 1,
    is_principal : 1,
    note : 'test inserted'
  };

  var DELETABLE_FEE_CENTER_ID = 3;
  var FETCHABLE_FEE_CENTER_ID = 1;

  var responseKeys = [
    'project_id', 'id', 'label', 'is_cost', 'note', 'is_principal'
  ];


  it('GET /fee_centers returns a list of fee centers', function () {
    return agent.get('/fee_centers')
      .then(function (res) {
        helpers.api.listed(res, 7);
      })
      .catch(helpers.handler);
  });

  /* @todo - make this route ?detailed=1 to conform to standards */
  it('GET /fee_centers?full=1 returns a full list of fee centers', function () {
    return agent.get('/fee_centers?full=1')
      .then(function (res) {
        helpers.api.listed(res, 7);
      })
     .catch(helpers.handler);
  });

  it('GET /fee_centers?available=1 returns a list of available fee centers', function () {
    return agent.get('/fee_centers?available=1')
      .then(function (res) {
        helpers.api.listed(res, 1);
      })
     .catch(helpers.handler);
  });

  it('GET /fee_centers?is_cost=1 returns a list of fee centers by filtering only cost center', function () {
    return agent.get('/fee_centers?is_cost=1')
      .then(function (res) {
        helpers.api.listed(res, 4);
      })
      .catch(helpers.handler);
  });

  it('GET /fee_centers?available=1&full=1 returns a full list of available fee centers', function () {
    return agent.get('/fee_centers?available=1&full=1')
      .then(function (res) {
        helpers.api.listed(res, 1);
      })
     .catch(helpers.handler);
  });

  it('GET /fee_centers?is_cost=1&is_principal=1 returns a list of principal fee center which are cost', function () {
    return agent.get('/fee_centers?is_cost=1&is_principal=1')
      .then(function (res) {
        helpers.api.listed(res, 3);
      })
      .catch(helpers.handler);
  });

  it('GET /fee_center/:id returns one fee center', function () {
    return agent.get('/fee_centers/'+ FETCHABLE_FEE_CENTER_ID)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body.id).to.be.equal(FETCHABLE_FEE_CENTER_ID);
        expect(res.body).to.have.all.keys(responseKeys);
      })
      .catch(helpers.handler);
  });

  it('GET /fee_center/:id returns a 404 for an unknown fee center id', function () {
    return agent.get('/fee_centers/unknown')
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });



  /* @todo - should this return a simple number? */
  it.skip('GET /cost_centers/:id/cost returns the cost of a provided cost center', function () {
    return agent.get('/cost_centers/:id/cost'.replace(':id', FETCHABLE_FEE_CENTER_ID))
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body).to.have.all.keys('cost');
        expect(res.body.cost).to.satisfy(function (cost) { return cost >= 0;});
      })
      .catch(helpers.handler);
  });

  it('POST /fee_centers adds a fee center', function () {
    return agent.post('/fee_centers')
      .send(newFeeCenter)
      .then(function (res) {
        helpers.api.created(res);
        newFeeCenter.id = res.body.id;
        return agent.get('/fee_centers/' + newFeeCenter.id);
      })
      .then(function (res){
        expect(res).to.have.status(200);
        expect(res.body).to.have.all.keys(responseKeys);
      })
      .catch(helpers.handler);
  });

  it('PUT /fee_centers/:id updates the newly added fee center', function () {
    var updateInfo = { note : 'update value for note' };
    return agent.put('/fee_centers/' + newFeeCenter.id)
      .send(updateInfo)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.id).to.equal(newFeeCenter.id);
        expect(res.body.note).to.equal(updateInfo.note);
      })
      .catch(helpers.handler);
  });

  it.skip('DELETE /fee_centers/:id deletes a fee_center', function () {
    return agent.delete('/fee_centers/' + DELETABLE_FEE_CENTER_ID)
      .then(function (res) {
        helpers.api.deleted(res);
        return agent.get('/fee_centers/' + DELETABLE_FEE_CENTER_ID);
      })
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it.skip('DELETE /fee_centers/:id returns a 404 for an unknown fee center id', function () {
    return agent.delete('/fee_centers/unknown')
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });
});
