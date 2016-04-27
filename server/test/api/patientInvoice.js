/* jshint expr:true */
const chai = require('chai');
const expect = chai.expect;
const uuid = require('node-uuid');

/** import test helpers */
const helpers = require('./helpers');
helpers.configure(chai);

/** The /sales API endpoint */
describe('The /sales API', function () {
  'use strict';

  /** login at the start of the test */
  const agent = chai.request.agent(helpers.baseUrl);
  before(helpers.login(agent));

  /** @const total number of sales in the database */
  const numSales = 2;
  const numCreatedSales = 3;
  const fetchableInvoiceUuid = '957e4e79-a6bb-4b4d-a8f7-c42152b2c2f6';

  /** @const a reference for one of the sales in the database */
  const reference = 'TPA1';

  // run the 'BillingScenarios' test suite
  describe('(POST /sales)', BillingScenarios);

  it('GET /sales returns a list of patient invoices', function () {
    return agent.get('/sales')
      .then(function (res) {
        helpers.api.listed(res, numSales);
      })
      .catch(helpers.handler);
  });

  it('GET /sales/:uuid returns a valid patient invoice', function () {
    return agent.get('/sales/'.concat(fetchableInvoiceUuid))
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;

        var sale = res.body;

        expect(sale).to.not.be.empty;
        expect(sale).to.contain.keys('uuid', 'cost', 'date', 'items');
        expect(sale.items).to.not.be.empty;
        expect(sale.items[0]).to.contain.keys('uuid', 'code', 'quantity');
      })
      .catch(helpers.handler);
  });

  it('GET /sales/:uuid returns 404 for an invalid patient invoice', function () {
    return agent.get('/sales/unknown')
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });


  describe.skip('(/sales/search) Search interface for the sales table', function () {

    // no parameters provided
    it('GET /sales/search should return all sales if no query string provided', function () {
      return agent.get('/sales/search')
        .then(function (res) {
          helpers.api.listed(res, numCreatedSales);
        })
        .catch(helpers.handler);
    });

    // valid filter, all results
    it('GET /sales/search?debtor_uuid=3be232f9-a4b9-4af6-984c-5d3f87d5c107 should return two sales', function () {
      return agent.get('/sales/search?debtor_uuid=3be232f9-a4b9-4af6-984c-5d3f87d5c107')
        .then(function (res) {
          helpers.api.listed(res, numCreatedSales);
        })
        .catch(helpers.handler);
    });

    // valid filter, but no results expected
    it('GET /sales/search?cost=0 should return no sales', function () {
      return agent.get('/sales/search?cost=0')
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.have.length(0);
        })
        .catch(helpers.handler);
    });

    // invalid filter should fail with database error
    it('GET /sales/search?invalidKey=invalidValue should error w/ 400 status', function () {
      return agent.get('/sales/search?invalidKey=invalidValue')
        .then(function (res) {
          helpers.api.errored(res, 400);
        })
        .catch(helpers.handler);
    });

    // filter should find exactly one result
    it('GET /sales/search?cost=75 should return a single sale', function () {
      return agent.get('/sales/search?cost=75')
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.have.length(1);
        })
        .catch(helpers.handler);
    });

    // filter should combine to find the same result as above
    it('GET /sales/search?cost=75&project_id=1 should return a single sale (combined filter)', function () {
      return agent.get('/sales/search?cost=75&project_id=1')
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.have.length(1);
        })
        .catch(helpers.handler);
    });

    it('GET /sales/search?cost=15&project_id=1 should not return any results', function () {
      return agent.get('/sales/search?cost=15&project_id=1')
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.have.length(0);
        })
        .catch(helpers.handler);
    });
  });

  describe('(/sales/references) reference interface for the sales table', function () {

    it('GET /sales/reference/:reference should return a uuid for a valid sale reference', function () {
      return agent.get('/sales/references/'.concat(reference))
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.have.property('uuid');
        })
        .catch(helpers.handler);
    });

    it('GET /sales/references/:reference should fail for an invalid sale reference', function () {
      return agent.get('/sales/references/unknown')
        .then(function (res) {
          helpers.api.errored(res, 404);
        })
        .catch(helpers.handler);
    });
  });
});

/**
 * Patient Invoicing Scenarios
 *
 * This test suite goes through a variety of testing scenarios to ensure the
 * API is bullet-proof.
 */
function BillingScenarios() {
  'use strict';

  const agent = chai.request.agent(helpers.baseUrl);
  before(helpers.login(agent));

  /**
   * A simple invoice that should be posted without issue.  This demonstrates
   * that the POST /sales route works as intended for the simple invoicing of
   * patients.  Demonstrates:
   *  1) @todo the "debit" field is not required in sale_items and should be
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
    project_id: helpers.data.PROJECT,
    // cost: 35,  // this cost should be calculated by the server (see test).
    debtor_uuid: '3be232f9-a4b9-4af6-984c-5d3f87d5c107',
    date: new Date('2016-01-13'),
    description: 'TPA_VENTE/Wed Jan 13 2016 10:33:34 GMT+0100 (WAT)/Test 2 Patient',
    service_id: helpers.data.ADMIN_SERVICE,
    user_id : helpers.data.OTHERUSER,
    is_distributable: true,

    /** @todo - change this API to not need credit/debit fields */
    items : [{
      inventory_uuid: '289cc0a1-b90f-11e5-8c73-159fdc73ab02',
      quantity: 1,
      inventory_price: 8,
      transaction_price: 10,
      credit: 10,
    }, {
      inventory_uuid: 'cf05da13-b477-11e5-b297-023919d3d5b0',
      quantity: 1,
      inventory_price: 25,
      transaction_price: 25,
      credit: 25,
    }]
  };

  it('creates and posts a patient invoice (simple)', () => {
    return agent.post('/sales')
      .send({ sale : simpleInvoice })
      .then(function (res) {
        helpers.api.created(res);

        // make sure we can locate the invoice in the database
        return agent.get('/sales/'.concat(res.body.uuid));
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;

        // ensure the data in the database is correct
        let invoice = res.body;
        expect(invoice.cost).to.equal(35);
        expect(invoice.items).to.have.length(2);
        expect(invoice.discount).to.equal(0);

        // NOTE - this is not what was sent, but the server has corrected it.
        expect(invoice.user_id).to.equal(helpers.data.SUPERUSER);
      })
      .catch(helpers.handler);
  });

  /**
   * These tests check a few error conditions to make sure the server's API
   * doesn't break on errors.
   */
  it('handles error scenarios for simple invoicing', () => {

    // test what happens when the debtor is missing
    let missingDebtorUuid = helpers.mask(simpleInvoice, 'debtor_uuid');

    return agent.post('/sales')
      .send({ sale : missingDebtorUuid })
      .then((res) => {
        helpers.api.errored(res, 400);

        // what happens when there is no date sent to the server
        let missingDate = helpers.mask(simpleInvoice, 'date');
        return agent.post('/sales').send({ sale : missingDate });
      })
      .then((res) => {
        helpers.api.errored(res, 400);

        // what happens when no items are sent to the server
        let missingItems = helpers.mask(simpleInvoice, 'items');
        return agent.post('/sales').send({ sale : missingItems });
      })
      .then((res) => {
        helpers.api.errored(res, 400);

        // what happens when no description is sent to the server
        let missingDescription = helpers.mask(simpleInvoice, 'description');
        return agent.post('/sales').send({ sale : missingDescription });
      })
      .then((res) => {
        helpers.api.errored(res, 400);

        // make sure an empty object fails
        let emptyObject = {};
        return agent.post('/sales').send({ sale : emptyObject });
      })
      .then((res) => {
        helpers.api.errored(res, 400);
      })
      .catch(helpers.handler);
  });

  /**
   * This scenario tests that billing services work properly.  The simple
   * billing service invoice will include a single billing service, and checks
   * that the cost is correctly calculated.
   *
   * Implicit Checks:
   *  1) `user_id` is not required (default: current user)
   */
  const simpleBillingServiceInvoice = {
    project_id: helpers.data.PROJECT,
    debtor_uuid: '3be232f9-a4b9-4af6-984cj5d3f87d5c107',
    date: new Date('2016-01-28'),
    description: 'A simple billing service invoice',
    service_id: helpers.data.ADMIN_SERVICE,
    is_distributable : true,

    /** @todo - change this API to not need credit/debit fields */
    items : [{
      inventory_uuid: '289cc0a1-b90f-11e5-8c73-159fdc73ab02',
      quantity: 15,
      inventory_price: 5,
      transaction_price: 5,
      credit: 75,
    }, {
      inventory_uuid: 'cf05da13-b477-11e5-b297-023919d3d5b0',
      quantity: 1,
      inventory_price: 25,
      transaction_price: 25,
      credit: 25,
    }],

    /** @todo - change this API to take in an array of billing service ids */
    billingServices : {
      items : [{
        billing_service_id : 1
        // value : 20, // this is not required by the API (unsafe), but useful
                       // to see for the test scenario. This is a percentage.
      }]
    }
  };

  it('creates and posts a patient invoice (simple + 1 billing service)', () => {
    return agent.post('/sales')
      .send({ sale : simpleBillingServiceInvoice })
      .then(function (res) {
        helpers.api.created(res);

        // make sure we can locate the invoice in the database
        return agent.get('/sales/'.concat(res.body.uuid));
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;

        // ensure the data in the database is correct
        let invoice = res.body;

        // this is the invoice cost ($100) + 20% ($20) of billing service
        expect(invoice.cost).to.equal(120);
        expect(invoice.items).to.have.length(2);
        expect(invoice.discount).to.equal(0);
      })
      .catch(helpers.handler);
  });


  /**
   * This scenario tests that subsidies work properly.  The simple subsidy will
   * absorb some of a patient's cost into a subsidy account.  The API only
   * supports a single subsidy per invoice.  See #343 for more information.
   */
  const simpleSubsidyInvoice = {
    project_id: helpers.data.PROJECT,
    debtor_uuid: '3be232f9-a4b9-4af6-984cj5d3f87d5c107',
    date: new Date('2016-01-28'),
    description: 'A simple subsidy invoice',
    service_id: helpers.data.ADMIN_SERVICE,
    is_distributable : true,

    /** @todo - change this API to not need credit/debit fields */
    items : [{
      inventory_uuid: '289cc0a1-b90f-11e5-8c73-159fdc73ab02',
      quantity: 25,
      inventory_price: 0.25,
      transaction_price: 0.21,
      credit: 5.25,
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
      credit: 40.95,
    }],

    /** @todo - change this API to take in an array of subsidy ids */
    subsidies : {
      items : [{
        subsidy_id : 1
        // value : 50, // this is not required by the API (unsafe), but useful
                       // to see for the test scenario. This is a percentage.
      }]
    }
  };

  it('creates and posts a patient invoice (simple + 1 subsidy)', () => {
    return agent.post('/sales')
      .send({ sale : simpleSubsidyInvoice })
      .then(function (res) {
        helpers.api.created(res);

        // make sure we can locate the invoice in the database
        return agent.get('/sales/'.concat(res.body.uuid));
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;

        // ensure the data in the database is correct
        let invoice = res.body;

        // this is the cost ($80.29) - 50% ($40.145) of subsidy
        expect(invoice.cost).to.equal(40.145);
        expect(invoice.items).to.have.length(3);
        expect(invoice.discount).to.equal(0);
      })
      .catch(helpers.handler);
  });
}
