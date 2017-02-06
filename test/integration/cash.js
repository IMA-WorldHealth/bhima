'use strict';

/* global expect, chai, agent */
/* jshint expr : true */

const helpers = require('./helpers');
const _ = require('lodash');

const CashInvoicePayments = require('./cash.invoices');
const CashCautionPayments = require('./cash.cautions');
const CashSearch = require('./cash.search');

describe('(/cash) Cash Payments', function () {

  const NUM_CASH_PAYMENTS = 1;

  // can't find undefined cash payments
  it('GET /cash/undefined returns an error', function () {
    return agent.get('/cash/undefined')
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it ('GET /cash returns the expected number of payments', function () {
    return agent.get('/cash')
      .then(function (res) {
        helpers.api.listed(res, NUM_CASH_PAYMENTS);
      })
      .catch(helpers.handler);
  });

  // Tests for the Caution Payment Interface
  describe('Caution Payments ', CashCautionPayments);

  // Tests for the Payment Invoice Payment Interface
  describe('Patient Invoice Payments ', CashInvoicePayments);

  // test for cash search
  describe('(/search) Search', CashSearch);
});
