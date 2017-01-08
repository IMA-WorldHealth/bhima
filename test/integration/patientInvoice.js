/* global expect, chai, agent */
/* jshint expr : true */

const uuid = require('node-uuid');
const helpers = require('./helpers');

/** @todo passing the date as an object causes the invoice request object to
 * be sent in a different order, breaking the staging/ writing process - this
 * should be fixed and verified with tests */

/* The /invoices API endpoint */
describe('(/invoices) Patient Invoices', function () {
  'use strict';

  /* total number of invoices in the database */
  const numInvoices = 2;
  const numCreatedInvoices = 3;
  const fetchableInvoiceUuid = '957e4e79-a6bb-4b4d-a8f7-c42152b2c2f6';
  const debtorUuid = '3be232f9-a4b9-4af6-984c-5d3f87d5c107';

  // run the 'BillingScenarios' test suite
  describe('(POST /invoices)', BillingScenarios);

  it('GET /invoices returns a list of patient invoices', function () {
    return agent.get('/invoices')
      .then(function (res) {
        helpers.api.listed(res, numInvoices);
      })
      .catch(helpers.handler);
  });

  it('GET /invoices/:uuid returns a valid patient invoice', function () {
    return agent.get(`/invoices/${fetchableInvoiceUuid}`)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;

        var invoice = res.body;

        expect(invoice).to.not.be.empty;
        expect(invoice).to.contain.keys('uuid', 'cost', 'date', 'items');
        expect(invoice.items).to.not.be.empty;
        expect(invoice.items[0]).to.contain.keys('uuid', 'code', 'quantity');
      })
      .catch(helpers.handler);
  });

  it('GET /invoices/:uuid returns 404 for an invalid patient invoice', function () {
    return agent.get('/invoices/unknown')
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('GET patients/:uuid/invoices/latest shows the most recent bill of a patient', () => {
    return agent.get(`/patients/${debtorUuid}/invoices/latest`)
      .then(function (result) {
        expect(result).to.have.status(200);
        expect(result).to.be.json;
        expect(result.body).to.have.keys('uid', 'reference', 'credit', 'debit', 'balance', 'entity_uuid', 'uuid', 'display_name', 'debtor_uuid', 'date', 'cost', 'numberPayment', 'invoicesLength');
        expect(result.body.entity_uuid).to.equal(debtorUuid);
      })
      .catch(helpers.handler);
  });


  describe('(/invoices/search) Search interface for the invoices table', function () {

    // no parameters provided
    it('GET /invoices/search should return all invoices if no query string provided', function () {
      return agent.get('/invoices/search')
        .then(function (res) {
          helpers.api.listed(res, numInvoices + numCreatedInvoices);
        })
        .catch(helpers.handler);
    });

    it('GET /invoices/search?debtor_uuid=3be232f9-a4b9-4af6-984c-5d3f87d5c107 should return two invoices', function () {
      return agent.get('/invoices/search?debtor_uuid=3be232f9-a4b9-4af6-984c-5d3f87d5c107')
        .then(function (res) {
          helpers.api.listed(res, 5);
        })
        .catch(helpers.handler);
    });

    // valid filter, but no results expected
    it('GET /invoices/search?cost=0 should return no invoices', function () {
      return agent.get('/invoices/search?cost=0')
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.have.length(0);
        })
        .catch(helpers.handler);
    });

    // invalid filter should fail with database error
    it('GET /invoices/search?invalidKey=invalidValue should error w/ 400 status', function () {
      return agent.get('/invoices/search?invalidKey=invalidValue')
        .then(function (res) {
          helpers.api.errored(res, 400);
        })
        .catch(helpers.handler);
    });

    // filter should find exactly one result
    it('GET /invoices/search?cost=75 should return a single invoice', function () {
      return agent.get('/invoices/search?cost=75')
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.have.length(1);
        })
        .catch(helpers.handler);
    });

    /**
     * filter should combine to find the same result as above
     * @fixme: there is more than one `project_id` which are returned,
     * the reason is the join between invoice and voucher tables
     * @fixme: not secure utility `util.queryCondition()` which allows to `table.column` synthax
     * ex. /invoices/search?cost=75&project.id=1
     */
    it.skip('GET /invoices/search?cost=75&project_id=1 should return a single invoice (combined filter)', function () {
      return agent.get('/invoices/search?cost=75&project_id=1')
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.have.length(1);
        })
        .catch(helpers.handler);
    });

    /**
     * @fixme: same as above
     */
    it.skip('GET /invoices/search?cost=15&project_id=1 should not return any results', function () {
      return agent.get('/invoices/search?cost=15&project_id=1')
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.have.length(0);
        })
        .catch(helpers.handler);
    });
  });
});

/*
 * Patient Invoicing Scenarios
 *
 * This test suite goes through a variety of testing scenarios to ensure the
 * API is bullet-proof.
 */
function BillingScenarios() {
  'use strict';

  /*
   * A simple invoice that should be posted without issue.  This demonstrates
   * that the POST /invoices route works as intended for the simple invoicing of
   * patients.  Demonstrates:
   *  1) @todo the "debit" field is not required in invoice_items and should be
   *    removed in the future
   *  2) The is_distributed field takes a boolean value
   *  3) Uuids are not required and will be generated by the server.
   *  4) The 'cost' field is not required and will be (correctly) calculated by
   *    the server
   *  5) Changing the 'inventory_price' does not have side-effects - it is only
   *    the 'transaction_price' that has any bearing.
   *  6) The 'user_id' should be ignored, and default to the logged in user.
   */
  const simpleInvoice = {
    is_distributable: 1,
    date: new Date(),
    cost: 35.14,  // this cost should be calculated by the server (see test).
    description: 'A Simple Invoice of two items costing $35.14',
    service_id: helpers.data.ADMIN_SERVICE,
    debtor_uuid: '3be232f9-a4b9-4af6-984c-5d3f87d5c107',
    project_id: helpers.data.PROJECT,
    user_id : helpers.data.OTHERUSER,

    /* @todo - change this API to not need credit/debit fields */
    items : [{
      inventory_uuid: '289cc0a1-b90f-11e5-8c73-159fdc73ab02',
      quantity: 1,
      inventory_price: 8,
      transaction_price: 10.14,
      credit: 10.14
    }, {
      inventory_uuid: 'cf05da13-b477-11e5-b297-023919d3d5b0',
      quantity: 1,
      inventory_price: 25,
      transaction_price: 25,
      credit: 25
    }]
  };

  it('creates and posts a patient invoice (simple)', () => {
    return agent.post('/invoices')
      .send({ invoice : simpleInvoice })
      .then(function (res) {
        helpers.api.created(res);

        // make sure we can locate the invoice in the database
        return agent.get('/invoices/'.concat(res.body.uuid));
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;

        // ensure the data in the database is correct
        let invoice = res.body;
        expect(invoice.cost).to.equal(simpleInvoice.cost);
        expect(invoice.items).to.have.length(simpleInvoice.items.length);

        // NOTE - this is not what was sent, but the server has corrected it.
        expect(invoice.user_id).to.equal(helpers.data.SUPERUSER);
      })
      .catch(helpers.handler);
  });

  /*
   * These tests check a few error conditions to make sure the server's API
   * doesn't break on errors.
   */
  it('handles error scenarios for simple invoicing', () => {

    // test what happens when the debtor is missing
    let missingDebtorUuid = helpers.mask(simpleInvoice, 'debtor_uuid');
    missingDebtorUuid.description = missingDebtorUuid.description.concat(' missing debtor_uuid');

    return agent.post('/invoices')
      .send({ invoice : missingDebtorUuid })
      .then((res) => {
        helpers.api.errored(res, 400);

        // what happens when there is no date sent to the server
        let missingDate = helpers.mask(simpleInvoice, 'date');
        missingDate.description = missingDate.description.concat(' missing date');
        return agent.post('/invoices').send({ invoice : missingDate });
      })
      .then((res) => {
        helpers.api.errored(res, 400);

        // what happens when no items are sent to the server
        let missingItems = helpers.mask(simpleInvoice, 'items');
        missingItems.description = missingItems.description.concat(' missing items');
        return agent.post('/invoices').send({ invoice : missingItems });
      })
      .then((res) => {
        helpers.api.errored(res, 400);

        // what happens when no description is sent to the server
        let missingDescription = helpers.mask(simpleInvoice, 'description');
        return agent.post('/invoices').send({ invoice : missingDescription });
      })
      .then((res) => {
        helpers.api.errored(res, 400);

        // make sure an empty object fails
        let emptyObject = {};
        return agent.post('/invoices').send({ invoice : emptyObject });
      })
      .then((res) => {
        helpers.api.errored(res, 400);
      })
      .catch(helpers.handler);
  });

  /*
   * This scenario tests that billing services work properly.  The simple
   * billing service invoice will include a single billing service, and checks
   * that the cost is correctly calculated.
   *
   * Implicit Checks:
   *  1) `user_id` is not required (default: current user)
   */
  const simpleBillingServiceInvoice = {
    is_distributable : true,
    date: new Date('2016-01-28').toISOString(),
    cost : 100,
    description: 'An invoice of two items costing $100 + a billing service',
    service_id: helpers.data.ADMIN_SERVICE,
    debtor_uuid: '3be232f9-a4b9-4af6-984cj5d3f87d5c107',
    project_id: helpers.data.PROJECT,

    /* @todo - change this API to not need credit/debit fields */
    items : [{
      inventory_uuid: '289cc0a1-b90f-11e5-8c73-159fdc73ab02',
      quantity: 15,
      inventory_price: 5,
      transaction_price: 5,
      credit: 75
    }, {
      inventory_uuid: 'cf05da13-b477-11e5-b297-023919d3d5b0',
      quantity: 1,
      inventory_price: 25,
      transaction_price: 25,
      credit: 25
    }],

    billingServices : [ 1 ]
  };

  it('creates and posts a patient invoice (simple + 1 billing service)', () => {
    return agent.post('/invoices')
      .send({ invoice : simpleBillingServiceInvoice })
      .then(function (res) {
        helpers.api.created(res);

        // make sure we can locate the invoice in the database
        return agent.get('/invoices/'.concat(res.body.uuid));
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;

        // ensure the data in the database is correct
        let invoice = res.body;

        // this is the invoice cost ($100) + 20% ($20) of billing service
        expect(invoice.cost).to.equal(120);
        expect(invoice.items).to.have.length(2);
      })
      .catch(helpers.handler);
  });


  /*
   * This scenario tests that subsidies work properly.  The simple subsidy will
   * absorb some of a patient's cost into a subsidy account.  The API only
   * supports a single subsidy per invoice.  See #343 for more information.
   */
  const simpleSubsidyInvoice = {
    is_distributable : true,
    date: new Date('2016-01-28').toISOString(),
    cost : 39.34,
    description: 'An invoice of three items costing $39.34 + a subsidy',
    service_id: helpers.data.ADMIN_SERVICE,
    debtor_uuid: '3be232f9-a4b9-4af6-984cj5d3f87d5c107',
    project_id: helpers.data.PROJECT,

    /* @todo - change this API to not need credit/debit fields */
    items : [{
      inventory_uuid: '289cc0a1-b90f-11e5-8c73-159fdc73ab02',
      quantity: 25,
      inventory_price: 0.25,
      transaction_price: 0.21,
      credit: 5.25
    }, {
      inventory_uuid: 'cf05da13-b477-11e5-b297-023919d3d5b0',
      quantity: 7,
      inventory_price: 4.87,
      transaction_price: 4.87,
      credit: 34.09
    }, {
      inventory_uuid: 'c48a3c4b-c07d-4899-95af-411f7708e296',
      quantity: 13,
      inventory_price: 2.50,
      transaction_price: 3.15,
      credit: 40.95
    }],

    subsidies : [ 1 ]
  };

  it('creates and posts a patient invoice (simple + 1 subsidy)', () => {
    return agent.post('/invoices')
      .send({ invoice : simpleSubsidyInvoice })
      .then(function (res) {
        helpers.api.created(res);

        // make sure we can locate the invoice in the database
        return agent.get(`/invoices/${res.body.uuid}`);
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;

        // ensure the data in the database is correct
        let invoice = res.body;

        // this is the cost ($80.29) - 50% ($40.145) of subsidy
        expect(invoice.cost).to.equal(40.145);
        expect(invoice.items).to.have.length(3);
      })
      .catch(helpers.handler);
  });
}
