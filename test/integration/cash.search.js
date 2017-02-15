/* global expect, chai, agent */

'use strict';

/**
 * @overview CashPaymentsSearch
 *
 * @description
 * This file contains tests for the search API on the cash payments server
 * route.  These tests should cover all search possibilities.
 */

const helpers = require('./helpers');
const _ = require('lodash');

module.exports = CashPaymentsSearch;

function CashPaymentsSearch() {

  const NUM_CASH_RECORDS = 3;
  const DEBTOR_UUID = '3be232f9-a4b9-4af6-984c-5d3f87d5c107';

  const TODAY = new Date().toISOString().split('T')[0];

  let TOMORROW = new Date();
  TOMORROW.setDate(TOMORROW.getDate() + 1);
  TOMORROW = TOMORROW.toISOString().split('T')[0];

  // this is a quick querying function to reduce LOC
  const SendHTTPQuery = (parameters, numResults) => {
    return agent.get('/cash/search')
      .query(parameters)
      .then(function (res) {
        helpers.api.listed(res, numResults);
      })
      .catch(helpers.handler);
  };

  it('GET /cash/search without parameters returns all cash payments', function () {
    return agent.get('/cash/search')
      .then(function (res) {
        helpers.api.listed(res, NUM_CASH_RECORDS);
      })
      .catch(helpers.handler);
  });

  // test limit functionality alone
  it('GET /cash/search?limit=1 returns a single record', function () {
    const params = { limit : 1 };
    return SendHTTPQuery(params, 1);
  });

  it('GET /cash/search?is_caution=1 returns two records', function () {
    const params = { is_caution : 1 };
    return SendHTTPQuery(params, 2);
  });

  it('GET /cash/search?debtor_uuid=? returns 3 records', function () {
    const params = { debtor_uuid : DEBTOR_UUID };
    return SendHTTPQuery(params, 3);
  });

  it('GET /cash/search?is_caution=1&limit=1 should combine to return a single record', function () {
    const params = { is_caution : 1, limit : 1 };
    return SendHTTPQuery(params, 1);
  });

  it('GET /cash/search?cashbox_id=2 should return one record', function () {
    const params = { cashbox_id : 2 };
    return SendHTTPQuery(params, 1);
  });

  it('GET /cash/search?reference=CP.TPA.1 should return a single record', function () {
    const params = { reference : 'CP.TPA.1' };
    return SendHTTPQuery(params, 1);
  });

  it('GET /cash/search?dateFrom=2016-01-01 should return all records', function () {
    const params = { dateFrom: '2016-01-01' };
    return SendHTTPQuery(params, NUM_CASH_RECORDS);
  });

  it(`GET /cash/search?dateFrom=2016-01-01&dateTo=${TOMORROW} should return all records`, function () {
    const params = { dateFrom: '2016-01-01', dateTo : TOMORROW };
    return SendHTTPQuery(params, NUM_CASH_RECORDS);
  });

  it('GET /cash/search?user_id=1 should return all records', function () {
    const params = { user_id : 1 };
    return SendHTTPQuery(params, NUM_CASH_RECORDS);
  });

  it('GET /cash/search?currency_id=1 should return all records', function () {
    const params = { currency_id : 1 };
    return SendHTTPQuery(params, NUM_CASH_RECORDS);
  });
}
