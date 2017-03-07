/* global expect, chai, agent */

const helpers = require('./helpers');

describe('(/fee_centers) The fee center API', function () {

  const newFeeCenter = {
    project_id : 1,
    label : 'tested fee center',
    is_principal : 1,
    note : 'test inserted'
  };
  const updateInfo = { note : 'update value for note' };
  const DELETABLE_FEE_CENTER_ID = 3;
  const FETCHABLE_FEE_CENTER_ID = 1;
  const responseKeys = [
    'project_id', 'id', 'label', 'note', 'is_principal'
  ];
  let invalidFeeCenter = null;


  it('GET /fee_centers returns a list of fee centers', function () {
    return agent.get('/fee_centers')
      .then(function (res) {
        helpers.api.listed(res, 7);
      })
      .catch(helpers.handler);
  });

  it('GET /fee_centers?detailed=1 returns a detailed list of fee centers', function () {
    return agent.get('/fee_centers?detailed=1')
      .then(function (res) {
        helpers.api.listed(res, 7);
      })
      .catch(helpers.handler);
  });

  it('GET /fee_centers?available=1 returns a list of available fee centers', function () {
    return agent.get('/fee_centers?available=1')
      .then(function (res) {
        helpers.api.listed(res, 4);
      })
      .catch(helpers.handler);
  });

  it('GET /fee_centers?available=1&detailed=1 returns a detailed list of available fee centers', function () {
    return agent.get('/fee_centers?available=1&detailed=1')
      .then(function (res) {
        helpers.api.listed(res, 4);
      })
      .catch(helpers.handler);
  });

  it('GET /fee_centers?is_principal=1 returns a list of principal fee center', function () {
    return agent.get('/fee_centers?is_principal=1')
      .then(function (res) {
        helpers.api.listed(res, 6);
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
  it('GET /fee_centers/:id/value returns the value of a provided fee center', function () {

    //send one (TRANS4) transaction to the from the journal to the general ledger
    return agent.post('/trial_balance/post_transactions')
      .send({transactions : ['TRANS4']})
      .then(function () {
        return agent.get(`/fee_centers/${FETCHABLE_FEE_CENTER_ID}/value`)
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.not.be.empty;
        expect(res.body).to.have.all.keys('id', 'value');
        expect(res.body.value).to.satisfy(function (value) { return value >= 0;});
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

  it('POST /fee_centers refuses to insert a fee center without a project', function () {
    invalidFeeCenter = newFeeCenter;
    delete invalidFeeCenter.project_id;

    return agent.post('/fee_centers')
      .send(invalidFeeCenter)
      .then(function (res) {
        helpers.api.errored(res, 400);
      })
      .catch(helpers.handler);
  });

  it('POST /fee_centers refuses to insert a fee center without a label', function () {
    invalidFeeCenter = newFeeCenter;
    delete invalidFeeCenter.label;

    return agent.post('/fee_centers')
      .send(invalidFeeCenter)
      .then(function (res) {
        helpers.api.errored(res, 400);
      })
      .catch(helpers.handler);
  });

  it('PUT /fee_centers/:id updates the newly added fee center', function () {
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

  it('PUT /fee_centers/:id it throws an error when trying to update an unknown fee center', function () {

    return agent.put('/fee_centers/unknown')
      .send(invalidFeeCenter)
      .then(function (res) {
        helpers.api.errored(res, 404);
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