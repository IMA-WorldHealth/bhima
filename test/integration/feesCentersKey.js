/* global expect, agent */

const helpers = require('./helpers');

/*
 * The /distribution_center/distribution_key  API endpoint
 *
 * This test suite implements full CRUD on the /fee_center  HTTP API endpoint.
 */
describe.skip('(/fee_center_distribution_key) The /fee_center  API endpoint', () => {
  // distribution_center/distribution_key  we will add during this test suite.

  // it('POST /FEE_CENTER should create a new Auxiliary Fee Center 1', () => {
  //   return agent.post('/fee_center')
  //     .send(auxiliary1)
  //     .then((res) => {
  //       console.log(res.body);

  //       const response = res.body;
  //       expect(response.length).to.equal(1);
  //     })
  //     .catch(helpers.handler);
  // });

  // it('POST /FEE_CENTER should create a new Auxiliary Fee Center 2', () => {
  //   return agent.post('/fee_center')
  //     .send(auxiliary2)
  //     .then((res) => {
  //     })
  //     .catch(helpers.handler);
  // });

  // it('POST /FEE_CENTER should create a new Auxiliary Fee Center 3', () => {
  //   return agent.post('/fee_center')
  //     .send(auxiliary3)
  //     .then((res) => {
  //     })
  //     .catch(helpers.handler);
  // });  

  // it('POST /FEE_CENTER should create a new Auxiliary Fee Center 4', () => {
  //   return agent.post('/fee_center')
  //     .send(auxiliary4)
  //     .then((res) => {
  //     })
  //     .catch(helpers.handler);
  // });



  // it('GET /FEE_CENTER/:ID should not be found for unknown id', () => {
  //   return agent.get('/fee_center/unknownRubric')
  //     .then((res) => {
  //       const response = res.body;

  //       expect(response.feeCenter.length).to.equal(0);
  //       expect(response.references.length).to.equal(0);
  //     })
  //     .catch(helpers.handler);
  // });

  // it('PUT /FEE_CENTER  should update the Label for an existing Fee Center ', () => {
  //   return agent.put('/fee_center/'.concat(feeCenterId))
  //     .send(feeCenterUpt1)
  //     .then((res) => {
  //       const response = res.body;
  //       expect(res).to.have.status(200);
  //       expect(response.feeCenter[0].label).to.equal('Update Test');
  //     })
  //     .catch(helpers.handler);
  // });


  // it('PUT /FEE_CENTER  should update Fee Center Type, Reference fee Center for an existing Fee Center ', () => {
  //   return agent.put('/fee_center/'.concat(feeCenterId))
  //     .send(feeCenterUpt2)
  //     .then((res) => {
  //       const response = res.body;
  //       expect(res).to.have.status(200);
  //       expect(response.feeCenter[0].is_principal).to.equal(feeCenterUpt2.is_principal);
  //       expect(response.references[0].account_reference_id).to.equal(
  //         feeCenterUpt2.reference_fee_center[0].account_reference_id
  //       );
  //       expect(response.references[0].is_cost).to.equal(feeCenterUpt2.reference_fee_center[0].is_cost);
  //     })
  //     .catch(helpers.handler);
  // });

  // it('DELETE /FEE_CENTER/:ID should delete a Fee Center', () => {
  //   return agent.delete('/fee_center/'.concat(feeCenterId))
  //     .then((res) => {
  //       helpers.api.deleted(res);
  //     })
  //     .catch(helpers.handler);
  // });
});
