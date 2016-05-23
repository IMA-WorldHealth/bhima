/* jshint expr:true */
var chai = require('chai');
var expect = chai.expect;

var helpers = require('./helpers');
helpers.configure(chai);

describe('/reports/invoices Receipts Interface', function () { 
  var agent = chai.request.agent(helpers.baseUrl);
  before(helpers.login(agent));
  
  // known data for requests and assertions
  const validInvoice        = '957e4e79-a6bb-4b4d-a8f7-c42152b2c2f6';
  const invoiceItemLength   = 1;
  const invalidInvoice      = 'unknown';
  const jsonRenderTarget   = '?render=json';
  const htmlRenderTarget   = '?render=html';
  const pdfRenderTarget   = '?render=pdf';
  const invalidRenderTarget = '?render=unkownRender';

  it('GET /reports/invoices/:uuid should return report data for a valid invoice uuid', function () { 
    return agent.get('/reports/invoices/'.concat(validInvoice))
      .then(expectReportJSONSuccess)
      .catch(helpers.handler);
  });

  it('GET /reports/invoices/:uuid should return not found for invalid uuid', function () { 
    return agent.get('/reports/invoices/'.concat(invalidInvoice))
      .then(function (result) { 
        helpers.api.errored(result, 404);  
      })
      .catch(helpers.handler);
  }); 

  it('GET /reports/invoices/:uuid should return bad request for invalid renderer', function () { 
    return agent.get('/reports/invoices/'.concat(validInvoice, invalidRenderTarget))
      .then(function (result) { 
        helpers.api.errored(result, 400);
      })
      .catch(helpers.handler);
  });

  it('GET /reports/invoices/:uuid should return JSON data for `json` rendering target', function () { 
    return agent.get('/reports/invoices/'.concat(validInvoice, jsonRenderTarget))
      .then(expectReportJSONSuccess)
      .catch(helpers.handler);
  });
  
  it('GET /reports/invoices/:uuid should return HTML data for `html` rendering target', function () { 
    return agent.get('/reports/invoices/'.concat(validInvoice, htmlRenderTarget))
      .then(function (result) { 
        expect(result.headers['content-type']).to.equal('text/html; charset=utf-8');
        expect(result.text).to.not.be.empty;
      })
      .catch(helpers.handler);
  });
  
  it('GET /reports/invoices/:uuid should return PDF data for `pdf` rendering target', function () { 
    return agent.get('/reports/invoices/'.concat(validInvoice, pdfRenderTarget))
      .then(function (result) { 
        expect(result.headers['content-type']).to.equal('application/pdf');
        expect(result.type).to.equal('application/pdf');
      })
      .catch(helpers.handler);
  });
  
  // utility methods 
  function expectReportJSONSuccess(result) { 
    var recipientKeys = ['items', 'recipient', 'enterprise'];
    expect(result).to.have.status(200);
    expect(result.headers['content-type']).to.equal('application/json; charset=utf-8');
    expect(result).to.be.json;
    expect(result.body).to.contain.all.keys(recipientKeys);
    expect(result.body.items.length).to.equal(invoiceItemLength);
    return result;
  }
});
