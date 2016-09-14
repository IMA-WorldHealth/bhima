/* global expect, chai, agent */
/* jshint expr : true */

const helpers = require('../../helpers');

describe('/reports/finance/invoices Receipts Interface', function () {

  // known data for requests and assertions
  const validInvoice        = '957e4e79-a6bb-4b4d-a8f7-c42152b2c2f6';
  const invoiceItemLength   = 1;
  const invalidInvoice      = 'unknown';
  const jsonRenderTarget   = '?renderer=json';
  const htmlRenderTarget   = '?renderer=html';
  const pdfRenderTarget   = '?renderer=pdf';
  const invalidRenderTarget = '?renderer=unkownRender';

  it('GET /reports/finance/invoices/:uuid should return report data for a valid invoice uuid', function () {
    return agent.get('/reports/finance/invoices/'.concat(validInvoice))
      .then(expectReportJSONSuccess)
      .catch(helpers.handler);
  });

  it('GET /reports/finance/invoices/:uuid should return not found for invalid uuid', function () {
    return agent.get('/reports/finance/invoices/'.concat(invalidInvoice))
      .then(function (result) {
        helpers.api.errored(result, 404);
      })
      .catch(helpers.handler);
  });

  it('GET /reports/finance/invoices/:uuid should return bad request for invalid renderer', function () {
    return agent.get('/reports/finance/invoices/'.concat(validInvoice, invalidRenderTarget))
      .then(function (result) {
        helpers.api.errored(result, 400);
      })
      .catch(helpers.handler);
  });

  it('GET /reports/finance/invoices/:uuid should return JSON data for `json` rendering target', function () {
    return agent.get('/reports/finance/invoices/'.concat(validInvoice, jsonRenderTarget))
      .then(expectReportJSONSuccess)
      .catch(helpers.handler);
  });

  it('GET /reports/finance/invoices/:uuid should return HTML data for `html` rendering target', function () {
    return agent.get('/reports/finance/invoices/'.concat(validInvoice, htmlRenderTarget))
      .then(function (result) {
        expect(result.headers['content-type']).to.equal('text/html; charset=utf-8');
        expect(result.text).to.not.be.empty;
      })
      .catch(helpers.handler);
  });

  it('GET /reports/finance/invoices/:uuid should return PDF data for `pdf` rendering target', function () {
    return agent.get('/reports/finance/invoices/'.concat(validInvoice, pdfRenderTarget))
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
