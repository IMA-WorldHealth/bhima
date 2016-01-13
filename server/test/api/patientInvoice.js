/**
 * @todo Replace generic boilerplate code (environment variables etc.) with import
 */
var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;

var q = require('q');

var url = 'https://localhost:8080';
var user = { 
  username : 'superuser', 
  password : 'superuser', 
  project: 1
};

chai.use(chaiHttp);

// workaround for low node versions
if (!global.Promise) {
  var q = require('q');
  chai.request.addPromises(q.Promise);
}

// Environment variables - disable certificate errors
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

describe('The /sales API', function () { 
  var mockSaleUuid; 
  var agent = chai.request.agent(url);

  var mockSale = {
    sale : { 
      project_id: 1,
      cost: 35,
      currency_id: 2,
      debitor_uuid: '3be232f9-a4b9-4af6-984c-5d3f87d5c107',
      invoice_date: '2016-01-13',
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
  
  beforeEach(function () {
    return agent
      .post('/login')
      .send(user);
  });
  
  it('POST /sales will record a valid patient invoice and return success from the posting journal', function () { 
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
      .catch(handle);
  });

  it('GET /sales returns a list of patient invoices', function () {

    // This value depends on the success of the previous test
    var INITIAL_PATIENT_INVOICES = 1;

    return agent.get('/sales')
      .then(function (res) { 
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(res.body).to.have.length(INITIAL_PATIENT_INVOICES);
      })
      .catch(handle);
  });

  it('GET /sales/:uuid returns a valid patient invoice', function () {
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
      .catch(handle);
  });
  
  it('GET /sales/:uuid returns 404 for an invalid patient invoice', function () {
    
    return agent.get('/sales/unkown')
      .then(function (result) { 
        expect(result).to.have.status(404);
        expect(result.body).to.not.be.empty;
      })
      .catch(handle);
  });
  
  it('POST /sales returns 400 for an invalid patient invoice request object', function () {
    
    return agent.post('/sales')
      .send(invalidRequestSale)
      .then(function (res) { 
        expect(res).to.have.status(400);
        expect(res.body).to.not.be.empty;
      });
  });
  
  function handle(error) {
    throw error;
  }
});
