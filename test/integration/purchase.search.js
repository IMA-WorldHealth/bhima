/* global expect, chai, agent */

/**
 * @overview PurchaseOrderSearch
 *
 * @description
 * This file contains search tests for the purchase orders API.
 */

const helpers = require('./helpers');

module.exports = PurchaseOrderSearch;

function PurchaseOrderSearch() {
  const NUM_PURCHASE_ORDERS = 3;

  // this is a quick querying function to reduce LOC
  const SendHTTPQuery = (parameters, numResults) => {
    return agent.get('/purchases/search')
      .query(parameters)
      .then((res) => {
        helpers.api.listed(res, numResults);
      })
      .catch(helpers.handler);
  };

  it('GET /purchases/search returns all purchase orders', () => {
    return SendHTTPQuery({}, NUM_PURCHASE_ORDERS);
  });

  // TODO - implement limit query
  it('GET /purchases/search?limit=1 returns a single purchase order', () => {
    const options = { limit: 1 };
    return SendHTTPQuery(options, 1);
  });

  it('GET /purchases/search?dateFrom={date} returns a single purchase order from today', () => {
    const date = new Date('2016-02-19');
    const options = { dateFrom: date };
    return SendHTTPQuery(options, NUM_PURCHASE_ORDERS);
  });

  it('GET /purchases/search?reference=PO.TPA.1  returns a single purchase order', () => {
    const options = { reference: 'PO.TPA.1' };
    return SendHTTPQuery(options, 1);
  });
}
