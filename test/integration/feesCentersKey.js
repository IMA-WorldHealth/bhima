/* global expect, agent */

const helpers = require('./helpers');

/*
 * The /distribution_center/distribution_key  API endpoint
 *
 * This test suite implements full CRUD on the /fee_center  HTTP API endpoint.
 */
describe('(/fee_center_distribution_key) The /fee_center  API endpoint', () => {
  // distribution_center/distribution_key  we will add during this test suite.

  const distributionKey1 = {
    data : {
      auxiliary_fee_center_id: 6,
      values: { '1': 50, '2': 35, '3': 15 },
    }
  };

  const distributionKey2 = {
    data : {
      auxiliary_fee_center_id: 4,
      values: { '1': 95, '2': 3, '3': 2 },
    }
  };

  it('POST /distribution_fee_center/distributionKey a new Distribution Fee Center Key: 1', () => {
    return agent.post('/distribution_fee_center/distributionKey')
      .send(distributionKey1)
      .then((res) => {
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  it('POST /distribution_fee_center/distributionKey a new Distribution Fee Center Key: 2', () => {
    return agent.post('/distribution_fee_center/distributionKey')
      .send(distributionKey2)
      .then((res) => {
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  // it('GET /distribution_fee_center/getDistributed Get Auxiliaries Fees Centers Distributed to Main Fees Centers', () => {
  //   return agent.post('/distribution_fee_center/getDistributed')
  //     .send(distributionKey2)
  //     .then((res) => {
  //       helpers.api.created(res);
  //     })
  //     .catch(helpers.handler);
  // });

});
