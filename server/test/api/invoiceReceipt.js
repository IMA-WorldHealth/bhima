/* jshint expr:true */
var chai = require('chai');
var expect = chai.expect;

var helpers = require('./helpers');
helpers.configure(chai);

describe.only('/reports/invoices Receipts Interface', function () { 
  var agent = chai.request.agent(helpers.baseUrl);
  before(helpers.login(agent));
  
  // known data for requests and assertions
  const validInvoice = '957e4e79-a6bb-4b4d-a8f7-c42152b2c2f6';
  const invoiceItemLength = 1;
  const invalidInvoice = 'unknown';

  it('GET /reports/invoices/:uuid should return report data for a valid invoice uuid', function () { 
    var recipientKeys = ['items', 'recipient', 'enterprise'];

    return agent.get('/reports/invoices/'.concat(validInvoice))
      .then(function (result) { 
        expect(result).to.have.status(200);
        expect(result).to.be.json;
        expect(result.body).to.contain.all.keys(recipientKeys);
        expect(result.body.items.length).to.equal(invoiceItemLength);
      })
      .catch(helpers.handler);
  });

  it('GET /reports/invoices/:uuid should return not found for invalid uuid', function () { 
    return agent.get('/reports/invoices/'.concat(invalidInvoice))
      .then(function (result) { 
        helpers.api.errored(result, 404);  
      })
      .catch(helpers.handler);
  }); 
});
