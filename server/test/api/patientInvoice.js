/* jshint expr:true */

var chai = require('chai');
var expect = chai.expect;
var uuid = require('node-uuid');

/** import test helpers */
var helpers = require('./helpers');
helpers.configure(chai);

/** The /sales API endpoint */
describe('The /sales API', function () {
  var agent = chai.request.agent(helpers.baseUrl);

  /** login at the start of the test */
  before(helpers.login(agent));

  // mock sale items
  var mockItems = [{
    inventory_uuid: '289cc0a1-b90f-11e5-8c73-159fdc73ab02',
    quantity: 1,
    inventory_price: 10,
    transaction_price: 10,
    credit: 10,
    debit: 0
  }, {
    inventory_uuid: 'cf05da13-b477-11e5-b297-023919d3d5b0',
    quantity: 1,
    inventory_price: 25,
    transaction_price: 25,
    credit: 25,
    debit: 0
  }];

  // mock sale that should succeed
  var mockSale = {
    project_id: 1,
    cost: 35,
    currency_id: 2,
    debitor_uuid: '3be232f9-a4b9-4af6-984c-5d3f87d5c107',
    invoice_date: new Date('2016-01-13'),
    note: 'TPA_VENTE/Wed Jan 13 2016 10:33:34 GMT+0100 (WAT)/Test 2 Patient',
    service_id: 1,
    is_distributable: true,
    items : mockItems
  };

  // error cases

  var missingSaleItems = {
    project_id: 1,
    cost: 8.5,
    currency_id: 2,
    debitor_uuid: '3be232f9-a4b9-4af6-984c-5d3f87d5c107',
    invoice_date: new Date('2016-01-13'),
    note: 'TPA_VENTE/Wed Jan 13 2016 10:33:34 GMT+0100 (WAT)/Test 2 Patient',
    service_id: 1,
    is_distributable: true,
  };

  var missingSaleDate = {
    project_id: 1,
    cost: 35.0,
    currency_id: 2,
    debitor_uuid: '3be232f9-a4b9-4af6-984c-5d3f87d5c107',
    note: 'TPA_VENTE/Wed Jan 13 2016 10:33:34 GMT+0100 (WAT)/Test 2 Patient',
    service_id: 1,
    is_distributable: true,
    items : mockItems
  };

  /** @const total number of sales in the database */
  var numSales = 2;
  var numCreatedSales = 3;

  /** @const a reference for one of the sales in the database */
  var REFERENCE = 'TPA1';

  it('GET /sales returns a list of patient invoices', function () {
    return agent.get('/sales')
      .then(function (res) {
        helpers.api.listed(res, numSales);
      })
      .catch(helpers.handler);
  });

  // NOTE : Temporary skips while we are sorting the posting journal routes out

  it('POST /sales will record a valid patient invoice and return success from the posting journal', function () {
    return agent.post('/sales')
      .send({ sale : mockSale })
      .then(function (res) {
        helpers.api.created(res);
        mockSale.uuid = res.body.uuid;
        return agent.get('/sales/' + mockSale.uuid);
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
      })
      .catch(helpers.handler);
  });

  it('GET /sales/:uuid returns a valid patient invoice', function () {
    return agent.get('/sales/' + mockSale.uuid)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;

        var sale = res.body;

        expect(sale).to.not.be.empty;
        /** @todo -- change the sales API to make it more pleasing to use */
        //expect(sale).to.have.property('items');
        //expect(sale.items).to.not.be.empty;
        //expect(sale).to.contain.keys('uuid', 'cost', 'invoice_date');
        //expect(sale.items[0]).to.contain.keys('uuid', 'code', 'quantity');
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

  it('POST /sales returns 400 for an empty patient invoice request object', function () {
    return agent.post('/sales')
      .send({})
      .then(function (res) {
        helpers.api.errored(res, 400);
      })
      .catch(helpers.handler);
  });

  it('POST /sales returns 400 for a patient invoice missing a date', function () {
    return agent.post('/sales')
      .send({ sale : missingSaleDate })
      .then(function (res) {
        helpers.api.errored(res, 400);
      })
      .catch(helpers.handler);
  });

  it('POST /sales returns 400 for a patient invoice missing sale items', function () {
    return agent.post('/sales')
      .send({ sale : missingSaleItems })
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
          helpers.api.listed(res, numCreatedSales);
        })
        .catch(helpers.handler);
    });

    // valid filter, all results
    it('GET /sales/search?debitor_uuid=3be232f9-a4b9-4af6-984c-5d3f87d5c107 should return two sales', function () {
      return agent.get('/sales/search?debitor_uuid=3be232f9-a4b9-4af6-984c-5d3f87d5c107')
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

  describe('(/sales/references) reference interface for the sales table', function () {

    it('GET /sales/reference/:reference should return a uuid for a valid sale reference', function () {
      return agent.get('/sales/references/'.concat(REFERENCE))
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
