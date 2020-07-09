/* global expect, agent */

const helpers = require('./helpers');

/*
 * The /fee_center  API endpoint
 *
 * This test suite implements full CRUD on the /fee_center  HTTP API endpoint.
 */
describe('(/fee_center) The /fee_center  API endpoint', () => {
  // Fee Center we will add during this test suite.

  const { services } = helpers.data;

  const feeCenter = {
    id : 10,
    label : 'Centre de Frais Test',
    is_principal : 1,
    project_id : 1,
    reference_fee_center : [{
      account_reference_id : 6,
      is_cost : 1,
    }, {
      account_reference_id : 8,
      is_cost : 0,
    }],
    services : [services.test, services.admin],
  };

  const feeCenterUpt1 = {
    label : 'Update Test',
    is_principal : 1,
    project_id : 3,
    reference_fee_center : [{
      account_reference_id : 6,
      is_cost : 1,
    }, {
      account_reference_id : 8,
      is_cost : 0,
    }],
    services : [],
  };

  const feeCenterUpt2 = {
    label : 'Update Test',
    is_principal : 0,
    reference_fee_center : [{
      account_reference_id : 8,
      is_cost : 0,
    }],
    services : [],
  };

  const numFeeCenter = 6;
  const feeCenterId = 7;

  it('GET /fee_center returns a list of Fees Centers', () => {
    return agent.get('/fee_center')
      .then((res) => {
        helpers.api.listed(res, numFeeCenter);
      })
      .catch(helpers.handler);
  });

  it('POST /fee_center should create a new Fee Center', () => {
    return agent.post('/fee_center')
      .send(feeCenter)
      .then((res) => {
        const response = res.body;
        expect(response.length).to.equal(2);
      })
      .catch(helpers.handler);
  });

  it('GET /fee_center/:ID result should be empty for an unknown id', () => {
    return agent.get('/fee_center/123456789')
      .then((res) => {
        const response = res.body;
        expect(res).to.have.status(200);
        expect(response.feeCenter.length).to.equal(0);
        expect(response.references.length).to.equal(0);
      })
      .catch(helpers.handler);
  });

  it('GET /fee_center/:ID result should be empty if the fee center id is a string', () => {
    return agent.get('/fee_center/str')
      .then((res) => {
        const response = res.body;
        expect(res).to.have.status(200);
        expect(response.feeCenter.length).to.equal(0);
        expect(response.references.length).to.equal(0);
      })
      .catch(helpers.handler);
  });

  it('GET /fee_center/:ID result should be empty when the id is a string', () => {
    return agent.get('/fee_center/str')
      .then((res) => {
        const response = res.body;
        expect(res).to.have.status(200);
        expect(response.feeCenter.length).to.equal(0);
        expect(response.references.length).to.equal(0);
      })
      .catch(helpers.handler);
  });

  it('PUT /fee_center/:ID should update the Label for an existing Fee Center ', () => {
    return agent.put('/fee_center/'.concat(feeCenterId))
      .send(feeCenterUpt1)
      .then((res) => {
        const response = res.body;
        expect(res).to.have.status(200);
        expect(response.feeCenter[0].label).to.equal('Update Test');
      })
      .catch(helpers.handler);
  });

  it('PUT /fee_center/:ID should return 400 for an non-existing Fee Center ', () => {
    return agent.put('/fee_center/4321')
      .send(feeCenterUpt2)
      .then((res) => {
        helpers.api.errored(res, 400);
      })
      .catch(helpers.handler);
  });

  it('PUT /fee_center should return 400 if the Fee Center id is a string ', () => {
    return agent.put('/fee_center/str')
      .send(feeCenterUpt2)
      .then((res) => {
        helpers.api.errored(res, 400);
      })
      .catch(helpers.handler);
  });

  it('PUT /fee_center  should update Fee Center Type, Reference fee Center for an existing Fee Center ', () => {
    return agent.put('/fee_center/'.concat(feeCenterId))
      .send(feeCenterUpt2)
      .then((res) => {
        const response = res.body;
        expect(res).to.have.status(200);
        expect(response.feeCenter[0].is_principal).to.equal(feeCenterUpt2.is_principal);
        expect(response.references[0].account_reference_id).to.equal(
          feeCenterUpt2.reference_fee_center[0].account_reference_id,
        );
        expect(response.references[0].is_cost).to.equal(feeCenterUpt2.reference_fee_center[0].is_cost);
      })
      .catch(helpers.handler);
  });

  it('DELETE /fee_center/:id should delete a Fee Center', () => {
    return agent.delete('/fee_center/'.concat(feeCenterId))
      .then((res) => {
        helpers.api.deleted(res);
      })
      .catch(helpers.handler);
  });

  it('DELETE /fee_center/:id should return 404 for an unknown fee center', () => {
    return agent.delete('/fee_center/'.concat(404))
      .then((res) => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });
});
