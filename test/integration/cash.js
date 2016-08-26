/* global expect, chai, agent */
/* jshint expr : true */

const helpers = require('./helpers');

describe.only('(/cash) Cash Payments', function () {
  'use strict';

  const CASHBOX_ID  = 1;   // Test Primary Cashbox A
  const CURRENCY_ID = 1;   // Congolese Francs
  const PROJECT_ID  = 1;   // Test Project
  const DEBTOR_UUID =      // Test Patient
    '3be232f9-a4b9-4af6-984c-5d3f87d5c107';

  const USER_ID     = 1;   // Test User
  const INVOICES    = [    // invoices defined in the database
    { invoice_uuid : '957e4e79-a6bb-4b4d-a8f7-c42152b2c2f6', amount : 75.0 },
    { invoice_uuid : 'c44619e0-3a88-4754-a750-a414fc9567bf', amount : 25.0 }
  ];

  const REFERENCE = 'TPA1';


  // can't find undefined cash payments
  it('GET /cash/undefined returns an error', function () {
    return agent.get('/cash/undefined')
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  // Tests for the Caution Payment Interface
  describe('Caution Payments ', function () {

    const CAUTION_PAYMENT = {
      amount:      15000,
      currency_id: CURRENCY_ID,
      cashbox_id:  CASHBOX_ID,
      debtor_uuid: DEBTOR_UUID,
      project_id:  PROJECT_ID,
      date:        new Date('2015-01-01'),
      user_id:     USER_ID,
      is_caution:  1,
      description : 'A caution payment'
    };

    // create a caution payment
    it('POST /cash should create a caution payment', function () {
      return agent.post('/cash')
        .send({ payment : CAUTION_PAYMENT })
        .then(function (res) {

          // checks to see if the response correspond to the correct response codes
          helpers.api.created(res);

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
        })
        .catch(helpers.handler);
    });
  });


  // Tests for the Payment Invoice Payment Interface
  describe('Patient Invoice Payments ', function () {

    var INVOICE_PAYMENT = {
      amount:      70150,
      currency_id: CURRENCY_ID,
      cashbox_id:  CASHBOX_ID,
      debtor_uuid: DEBTOR_UUID,
      items:       INVOICES,
      project_id:  PROJECT_ID,
      user_id  :   USER_ID,
      is_caution:  0,
      description : 'This is a description'
    };

    var INVALID_INVOICE_PAYMENT = {
      amount:      1520,
      currency_id: CURRENCY_ID,
      cashbox_id:  CASHBOX_ID,
      debtor_uuid: DEBTOR_UUID,
      items:       [],
      project_id:  PROJECT_ID,
      user_id  :   USER_ID,
      is_caution:  0,
      description : 'This an invalid description'
    };

    // create a cash payment
    it('POST /cash should create a cash payment against multiple invoices', function () {
      return agent.post('/cash')
        .send({ payment : INVOICE_PAYMENT })
        .then(function (res) {

          // checks to see that the record was a successful api created response
          helpers.api.created(res);

          // store the payment id for later
          INVOICE_PAYMENT.uuid = res.body.uuid;

          // make sure the payment is retrievable
          return agent.get('/cash/' + INVOICE_PAYMENT.uuid);
        })
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.not.be.empty;

          expect(res.body.items).to.have.length(2);

          expect(res.body.uuid).to.equal(INVOICE_PAYMENT.uuid);
          expect(res.body.is_caution).to.equal(INVOICE_PAYMENT.is_caution);
          expect(res.body.currency_id).to.equal(INVOICE_PAYMENT.currency_id);
          expect(res.body.cashbox_id).to.equal(INVOICE_PAYMENT.cashbox_id);
        })
        .catch(helpers.handler);
    });

    it('POST /cash should not create a cash payment if cash items are empty', function () {
      return agent.post('/cash')
        .send({ payment : INVALID_INVOICE_PAYMENT })
        .then(function (res) {

          // anticipate a 400 error from the API.
          helpers.api.errored(res, 400);
        })
        .catch(helpers.handler);
    });

    it('PUT /cash/:uuid should update editable fields on a previous cash payment', function () {
      var DESC = 'I\'m adding a description!';

      return agent.put('/cash/' + INVOICE_PAYMENT.uuid)
        .send({ description : DESC })
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.not.be.empty;

          return agent.get('/cash/' + INVOICE_PAYMENT.uuid);
        })
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.not.be.empty;

          expect(res.body.items).to.have.length(2);

          expect(res.body.is_caution).to.equal(INVOICE_PAYMENT.is_caution);
          expect(res.body.description).to.equal(DESC);
        })
        .catch(helpers.handler);
    });

    it('PUT /cash/:uuid should not update non-editable fields on a previous cash payment', function () {
      return agent.put('/cash/' + INVOICE_PAYMENT.uuid)
        .send({ amount : 123000.13 })
        .then(function (res) {
          helpers.api.errored(res, 400);
        })
        .catch(helpers.handler);
    });

    // make sure we can find the cash payment
    it('GET /cash/:uuid should return the full payment details of a cash payment', function () {
      return agent.get('/cash/' + INVOICE_PAYMENT.uuid)
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res.body).to.not.be.empty;
          expect(res.body).to.have.keys(
            'uuid', 'reference', 'date', 'debtor_uuid', 'project_id', 'currency_id', 'items',
            'cashbox_id', 'amount', 'user_id', 'description', 'is_caution'
          );
        })
        .catch(helpers.handler);
    });

    // should not allow nefarious requests
    it('POST /cash should not process cash_items if is_caution flag is set', function () {
      var CONFUSED_PAYMENT = {
        amount:      15000,
        currency_id: CURRENCY_ID,
        cashbox_id:  CASHBOX_ID,
        debtor_uuid: DEBTOR_UUID,
        items:       INVOICES,
        project_id:  PROJECT_ID,
        date:        new Date('2015-05-01'),
        user_id:     USER_ID,
        is_caution:  1,
        description : 'This is a confused payment'
      };

      return agent.post('/cash')
        .send({ payment : CONFUSED_PAYMENT })
        .then(function (res) {

          // should have created successfully
          helpers.api.created(res);

          return agent.get('/cash/'.concat(res.body.uuid));
        })
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          // make sure that there are no associated items
          expect(res.body).to.not.be.empty;
          expect(res.body).to.have.property('items');
          expect(res.body.items).to.have.length(0);
        })
        .catch(helpers.handler);
    });
  });

  // the references API
  describe('(/cash/references) references for finding cash payment uuids', function () {
    it('GET /cash/references/unknown should return a 404 error', function () {
      agent.get('/cash/references/unknown')
        .then(function (res) {
          helpers.api.errored(res, 404);
        })
        .catch(helpers.handler);
    });

    it('GET /cash/references/:reference should return a uuid for a valid payment', function () {
      agent.get('/cash/references/'.concat(REFERENCE))
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.have.property('uuid');
        })
        .catch(helpers.handler);
    });
  });
});
