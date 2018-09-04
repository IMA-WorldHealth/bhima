/* global expect, agent */

const helpers = require('./helpers');

/*
 * The /fee_center  API endpoint
 *
 * This test suite implements full CRUD on the /fee_center  HTTP API endpoint.
 */
describe('(/fee_center) The /fee_center  API endpoint', () => {
  // Fee Center we will add during this test suite.

  const feeCenter = {
    id : 10,
    label : 'Centre de Frais Test',
    is_principal : 1,
    reference_fee_center : [{
      account_reference_id : 9,
      is_cost : 1,
    }, {
      account_reference_id : 8,
      is_cost : 0,
    }],
  };

  const feeCenterUpt1 = {
    label : 'Update Test',
    is_principal : 1,
    reference_fee_center : [{
      account_reference_id : 9,
      is_cost : 1,
    }, {
      account_reference_id : 8,
      is_cost : 0,
    }],
  };

  const feeCenterUpt2 = {
    label : 'Update Test',
    is_principal : 0,
    reference_fee_center : [{
      account_reference_id : 8,
      is_cost : 0,
    }],
  };

  const numFeeCenter = 2;
  const feeCenterId = 3;

  it('GET /FEE_CENTER returns a list of Fees Centers', () => {
    return agent.get('/fee_center')
      .then((res) => {
        helpers.api.listed(res, numFeeCenter);
      })
      .catch(helpers.handler);
  });

  it('POST /FEE_CENTER should create a new Fee Center', () => {
    return agent.post('/fee_center')
      .send(feeCenter)
      .then((res) => {
        const response = res.body;
        expect(response.length).to.equal(1);
      })
      .catch(helpers.handler);
  });

  it('GET /FEE_CENTER/:ID should not be found for unknown id', () => {
    return agent.get('/fee_center/unknownRubric')
      .then((res) => {
        const response = res.body;

        expect(response.feeCenter.length).to.equal(0);
        expect(response.references.length).to.equal(0);
      })
      .catch(helpers.handler);
  });

  it('PUT /FEE_CENTER  should update the Label for an existing Fee Center ', () => {
    return agent.put('/fee_center/'.concat(feeCenterId))
      .send(feeCenterUpt1)
      .then((res) => {
        const response = res.body;
        expect(res).to.have.status(200);
        expect(response.feeCenter[0].label).to.equal('Update Test');
      })
      .catch(helpers.handler);
  });


  it('PUT /FEE_CENTER  should update Fee Center Type, Reference fee Center for an existing Fee Center ', () => {
    return agent.put('/fee_center/'.concat(feeCenterId))
      .send(feeCenterUpt2)
      .then((res) => {
        const response = res.body;
        expect(res).to.have.status(200);
        expect(response.feeCenter[0].is_principal).to.equal(feeCenterUpt2.is_principal);
        expect(response.references[0].account_reference_id).to.equal(feeCenterUpt2.reference_fee_center[0].account_reference_id);
        expect(response.references[0].is_cost).to.equal(feeCenterUpt2.reference_fee_center[0].is_cost);
      })
      .catch(helpers.handler);
  });

  it('DELETE /FEE_CENTER/:ID will send back a 404 if the Fee Center does not exist', () => {
    return agent.delete('/fee_center/inknowRubric')
      .then((res) => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('DELETE /FEE_CENTER/:ID should delete a Fee Center', () => {
    return agent.delete('/fee_center/'.concat(feeCenterId))
      .then((res) => {
        helpers.api.deleted(res);
      })
      .catch(helpers.handler);
  });
});
