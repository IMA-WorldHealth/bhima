/* global describe, it, beforeEach */

var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;
chai.use(chaiHttp);

/** import test helpers */
var helpers = require('./helpers');
helpers.configure(chai);

/**
* The /cash API endpoint
*/
describe('(/cash) Cash Payments Interface ::', function () {
  'use strict';

  var agent = chai.request.agent(helpers.baseUrl);

  var CASHBOX_ID  = 1;   // Test Primary Cashbox A
  var CURRENCY_ID = 2;   // Congolese Francs
  var PROJECT_ID  = 1;   // Test Project
  var DEBTOR_UUID =      // Patient/1/Patient
    'a11e6b7f-fbbb-432e-ac2a-5312a66dccf4';
  var USER_ID     = 1;   // Test User
  var INVOICES    = [    // sales defined in the database
    { invoice_uuid : '957e4e79-a6bb-4b4d-a8f7-c42152b2c2f6', amount : 75.0 },
    { invoice_uuid : 'c44619e0-3a88-4754-a750-a414fc9567bf', amount : 25.0 }
  ];

  /** login before each request */
  beforeEach(helpers.login(agent));

  // no cash payments have been made yet
  it('GET /cash returns an empty list with no cash payments', function () {
    return agent.get('/cash')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.be.empty;
      })
      .catch(helpers.handler);
  });

  // can't find undefined cash payments
  it('GET /cash/undefined returns an error', function () {
    return agent.get('/cash/undefined')
      .then(function (res) {
        expect(res).to.have.status(404);
        expect(res.body).to.not.be.empty;
      })
      .catch(helpers.handler);
  });

  // Tests for the Caution Payment Interface
  describe('Caution Payments ::', function () {

    var CAUTION_PAYMENT = {
      amount:      15000,
      currency_id: CURRENCY_ID,
      cashbox_id:  CASHBOX_ID,
      debtor_uuid: DEBTOR_UUID,
      project_id:  PROJECT_ID,
      user_id  :   USER_ID,
      is_caution:  1
    };

    // create a caution payment
    it('POST /cash should create a caution payment', function () {
      return agent.post('/cash')
        .send({ payment : CAUTION_PAYMENT })
        .then(function (res) {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.not.be.empty;
          expect(res.body.uuid).to.be.defined;


          // store the payment id for later
          CAUTION_PAYMENT.uuid = res.body.uuid;

          // make sure the payment is retrievable
          return agent.get('/cash/' + CAUTION_PAYMENT.uuid);
        })
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.not.be.empty;

          expect(res.body.uuid).to.equal(CAUTION_PAYMENT.uuid);
          expect(res.body.currency_id).to.equal(CAUTION_PAYMENT.currency_id);
          expect(res.body.cashbox_id).to.equal(CAUTION_PAYMENT.cashbox_id);
          expect(res.body.is_caution).to.equal(CAUTION_PAYMENT.is_caution);
          expect(res.body.canceled).to.be.false;
        })
        .catch(helpers.handler);
    });
  });


  // Tests for the Payment Invoice Payment Interface
  //
  describe('Patient Invoice Payments ::', function () {

    var SALE_PAYMENT = {
      amount:      1520,
      currency_id: CURRENCY_ID,
      cashbox_id:  CASHBOX_ID,
      debtor_uuid: DEBTOR_UUID,
      items:       INVOICES,
      project_id:  PROJECT_ID,
      user_id  :   USER_ID,
      is_caution:  0
    };

    // create a cash payment
    it('POST /cash should create a cash payment against multiple sales', function () {
      return agent.post('/cash')
        .send({ payment : SALE_PAYMENT })
        .then(function (res) {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.not.be.empty;
          expect(res.body.uuid).to.be.defined;

          // store the payment id for later
          SALE_PAYMENT.uuid = res.body.uuid;

          // make sure the payment is retrievable
          return agent.get('/cash/' + SALE_PAYMENT.uuid);
        })
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.not.be.empty;

          expect(res.body.uuid).to.equal(SALE_PAYMENT.uuid);
          expect(res.body.is_caution).to.equal(SALE_PAYMENT.is_caution);
          expect(res.body.currency_id).to.equal(SALE_PAYMENT.currency_id);
          expect(res.body.cashbox_id).to.equal(SALE_PAYMENT.cashbox_id);
          expect(res.body.canceled).to.be.false;
        })
        .catch(helpers.handler);
    });

    it('PUT /cash/:uuid should update editable fields on a previous cash payment', function () {
      var DESC = 'I\'m adding a description!';

      return agent.put('/cash/' + SALE_PAYMENT.uuid)
        .send({ description : DESC })
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.not.be.empty;

          return agent.get('/cash/' + SALE_PAYMENT.uuid);
        })
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.not.be.empty;

          expect(res.body.is_caution).to.equal(SALE_PAYMENT.is_caution);
          expect(res.body.description).to.equal(DESC);
          expect(res.body.canceled).to.be.false;
        })
        .catch(helpers.handler);
    });

    it('PUT /cash/:uuid should not update non-editable fields on a previous cash payment', function () {
      return agent.put('/cash/' + SALE_PAYMENT.uuid)
        .send({ amount : 123000.13 })
        .then(function (res) {
          expect(res).to.have.status(400);
          expect(res).to.be.json;

          // expect to be an error
          expect(res.body).to.contain.all.keys(helpers.errorKeys);
        })
        .catch(helpers.handler);
    });

    // make sure we can find the cash payment
    it('GET /cash/:uuid should return the full payment details of a cash payment', function () {
      return agent.get('/cash/' + SALE_PAYMENT.uuid)
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res.body).to.not.be.empty;
          expect(res.body).to.have.keys(
            'uuid', 'reference', 'date', 'debtor_uuid', 'currency_id', 'items',
            'cashbox_id', 'amount', 'user_id', 'description', 'is_caution', 'canceled'
          );
        })
        .catch(helpers.handler);
    });
  });

  // The HTTP DELETE verb triggers a cash_discard record, but does not destroy any data
  // (proposed rename: debit_note)
  describe.skip('The Debit Note Interface ::', function () {

    it('DELETE /cash/:uuid should create a cash_discard record', function () {
      // TODO
    });

    it('DELETE /cash/:uuid should do nothing if the cash record is already discarded', function () {
      // TODO
    });

    it('DELETE-d cash records should still be discoverable by GET /cash', function () {
      // TODO
    });

    it('DELETE-d cash records should have the \'canceled\' property set', function () {
      // TODO
    });
  });
});
