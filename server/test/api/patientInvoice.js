/* jshint expr:true */
/* global describe, it, beforeEach */

var chai = require('chai');
var expect = chai.expect;
var uuid = require('node-uuid');

/** import test helpers */
var helpers = require('./helpers');
helpers.configure(chai);

/**
 * The /sales API endpoint
 */
describe('The /sales API', function () {
  var mockSaleUuid;
  var agent = chai.request.agent(helpers.baseUrl);

  var mockSale = {
    sale : {
      project_id: 1,
      cost: 35,
      currency_id: 2,
      debitor_uuid: '3be232f9-a4b9-4af6-984c-5d3f87d5c107',
      invoice_date: new Date('2016-01-13'),
      note: 'TPA_VENTE/Wed Jan 13 2016 10:33:34 GMT+0100 (WAT)/Test 2 Patient',
      service_id: 1,
      is_distributable: true
    },
    saleItems : [{
      inventory_uuid: '289cc0a1-b90f-11e5-8c73-159fdc73ab02',
      quantity: 1,
      inventory_price: 10,
      transaction_price: 10,
      credit: 10,
      debit: 0
    },{
      inventory_uuid: 'cf05da13-b477-11e5-b297-023919d3d5b0',
      quantity: 1,
      inventory_price: 25,
      transaction_price: 25,
      credit: 25,
      debit: 0
    }]
  };

  var invalidRequestSale = {
    badSale : {},
    invalidParams : {}
  };

  /** @const total number of sales in the database */
  var NUM_SALES = 2;

  /** login before each request */
  beforeEach(helpers.login(agent));

  // NOTE : Temporary skips while we are sorting the posting journal routes out

  it.skip('POST /sales will record a valid patient invoice and return success from the posting journal', function () {
    var UUID_LENGTH = 36;

    return agent.post('/sales')
      .send(mockSale)
      .then(function (confirmation) {
        expect(confirmation).to.have.status(201);
        expect(confirmation.body).to.contain.keys('uuid', 'results');
        expect(confirmation.body.uuid.length).to.be.equal(UUID_LENGTH);

        // If test has passed record UUID to use in further tests
        mockSaleUuid = confirmation.body.uuid;
      })
      .catch(helpers.handler);
  });

  it.skip('GET /sales returns a list of patient invoices', function () {

    // This value depends on the success of the previous test
    var INITIAL_PATIENT_INVOICES = 3;

    return agent.get('/sales')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(res.body).to.have.length(INITIAL_PATIENT_INVOICES);
      })
      .catch(helpers.handler);
  });

  it.skip('GET /sales/:uuid returns a valid patient invoice', function () {
    return agent.get('/sales/' + mockSaleUuid)
      .then(function (res) {
        var sale, saleItems, initialItem;
        expect(res).to.have.status(200);
        expect(res.body).to.contain.keys('sale', 'saleItems');

        sale = res.body.sale;
        saleItems = res.body.saleItems;
        initialItem = saleItems[0];

        expect(sale).to.not.be.empty;
        expect(saleItems).to.not.be.empty;
        expect(sale).to.contain.keys('uuid', 'cost', 'invoice_date');
        expect(initialItem).to.contain.keys('uuid', 'code', 'quantity');
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

  it('POST /sales returns 400 for an invalid patient invoice request object', function () {
    return agent.post('/sales')
      .send(invalidRequestSale)
      .then(function (res) {
        helpers.api.errored(res, 400);
      })
      .catch(helpers.handler);
  });

  describe('(/sales/search) Search interface for the sales table', function () {

    // no params provided
    it('GET /sales/search should return all sales if no query string provided', function () {
      return agent.get('/sales/search')
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.have.length(NUM_SALES);
        })
        .catch(helpers.handler);
    });

    // valid filter, all results
    it('GET /sales/search?debitor_uuid=3be232f9-a4b9-4af6-984c-5d3f87d5c107 should return two sales', function () {
      return agent.get('/sales/search?debitor_uuid=3be232f9-a4b9-4af6-984c-5d3f87d5c107')
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.have.length(2);
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
    it('GET /sales/search?cost=75&currency_id=2 should return a single sale (combined filter)', function () {
      return agent.get('/sales/search?cost=75&currency_id=2')
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.have.length(1);
        })
        .catch(helpers.handler);
    });

    it('GET /sales/search?cost=75&currency_id=1 should not return any results', function () {
      return agent.get('/sales/search?cost=75&currency_id=1')
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.have.length(0);
        })
        .catch(helpers.handler);
    });

  });
});
