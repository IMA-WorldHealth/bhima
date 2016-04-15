/* jshint expr: true */
var chai = require('chai');
var expect = chai.expect;

/** import test helpers */
var helpers = require('./helpers');
helpers.configure(chai);

const uuid = require('node-uuid');

/**
* The /vouchers API endpoint
*
* This test suit is about the vouchers table
*/
describe('(/vouchers) The vouchers HTTP endpoint', function () {
  'use strict';

  var agent = chai.request.agent(helpers.baseUrl);

  /** login before tests suite executes */
  before(helpers.login(agent));

  /** Test with dates */
  var date = new Date();

  var vUuid = uuid.v4();

  // balanced transaction with two lines (USD)
  var voucher = {
    uuid : vUuid,
    date : date,
    project_id : 1,
    currency_id : helpers.data.USD,
    amount : 10,
    description : 'Voucher Transaction',
    user_id : 1,
    items : [{
      uuid : uuid.v4(),
      account_id : 3631,
      debit : 10,
      credit : 0,
      document_uuid : uuid.v4(),
      voucher_uuid : vUuid
    }, {
      account_id: 3628,
      debit: 0,
      credit: 10,
      voucher_uuid : vUuid
    }]
  };

  // NOTE: this voucher does not have any uuids
  var items = [
    { account_id: 3631, debit: 11, credit: 0, document_uuid : uuid.v4(), entity_uuid : uuid.v4() },
    { account_id: 3637, debit: 0,  credit: 11, document_uuid : uuid.v4(), entity_uuid : uuid.v4() },
    { account_id: 3627, debit: 0,  credit: 12 },
    { account_id: 3628, debit: 12, credit: 0 }
  ];

  var secondVoucher = {
    date : date,
    project_id : 1,
    currency_id : helpers.data.USD,
    amount : 23,
    description : 'Multiple Voucher Transaction',
    user_id : 1,
    items : items
  };

  // only one item - bad transaction
  var badVoucher = {
    uuid : uuid.v4(),
    date : date,
    project_id : 1,
    currency_id : helpers.data.USD,
    amount : 10,
    description : 'Voucher Transaction',
    items : [{
      uuid : uuid.v4(),
      account_id : 3631,
      debit : 10,
      credit : 0,
    }]
  };

  // this voucher will not have an exchange rate
  var predatedVoucher = {
    uuid : uuid.v4(),
    date : new Date('2000-01-01'),
    project_id : 1,
    currency_id : helpers.data.FC,
    amount : 10,
    description : 'Voucher Transaction',
    user_id : 1,
    items : [{
      uuid : uuid.v4(),
      account_id : 3627,
      debit : 10,
      credit : 0,
    }, {
      uuid : uuid.v4(),
      account_id : 3637,
      debit : 0,
      credit : 10,
    }]
  };

  var mockVoucher;

  it('POST /vouchers create a new voucher record in voucher and voucher_item tables', function () {
    return agent.post('/vouchers')
      .send({ voucher : voucher })
      .then(function (res) {
        helpers.api.created(res);
        expect(res.body.uuid).to.be.equal(voucher.uuid);
      })
      .catch(helpers.handler);
  });

  it('POST /vouchers create a new voucher record with multiple voucher_items', function () {
    return agent.post('/vouchers')
      .send({ voucher : secondVoucher })
      .then(function (res) {
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  it('POST /vouchers doesn\'t register when missing data', function () {
    var uid = uuid.v4();
    mockVoucher = {
      uuid : uid,
      date : date,
      project_id : 1,
      currency_id : 1,
      amount : 10,
      description : 'Bad Voucher Transaction',
      document_uuid : uuid.v4(),
      user_id : 1,
      items : [{
        account_id : 3631,
        // missing debit field
        credit : 0,
        voucher_uuid : uid
      }]
    };

    return agent.post('/vouchers')
      .send({ voucher : mockVoucher })
      .then(function (res) {
        helpers.api.errored(res, 400);
      })
      .catch(helpers.handler);
  });

  it('POST /vouchers will reject a voucher will less than two records', function () {
    // attempt 1 - missing items completely + bad voucher
    return agent.post('/vouchers')
      .send({ voucher : { uuid : uuid.v4() }})
      .then(function (res) {
        helpers.api.errored(res, 400);

    // attempt 2 - only a single item
        return agent.post('/vouchers')
          .send({ voucher : badVoucher });
      })
      .then(function (res) {
        helpers.api.errored(res, 400);
      })
      .catch(helpers.handler);
  });

  it('POST /vouchers will reject a voucher with an invalid exchange rate', function () {
    return agent.post('/vouchers')
    .send({ voucher : predatedVoucher })
    .then(function (res) {
      helpers.api.errored(res, 400);
      expect(res.body.code).to.equal('ERRORS.NO_FISCAL_YEAR');
    })
    .catch(helpers.handler);
  });

  it('GET /vouchers returns a list of vouchers', function () {
    return agent.get('/vouchers')
      .then(function (res) {
        helpers.api.listed(res, 6);
      })
      .catch(helpers.handler);
  });

  it('GET /vouchers/:uuid returns a detail of a specified vouchers', function () {
    return agent.get('/vouchers/' + voucher.uuid)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(res.body.uuid).to.exist;
        expect(res.body.uuid).to.be.equal(voucher.uuid);
      })
      .catch(helpers.handler);
  });

  it('GET /vouchers/:uuid returns a NOT FOUND (404) when unknown {uuid}', function () {
    return agent.get('/vouchers/unknown')
      .then(function (res) {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('GET /vouchers returns a list of vouchers specified by query string', function () {
    return agent.get('/vouchers/?reference=unknown')
      .then(function (res) {
        helpers.api.listed(res, 0);
        return agent.get('/vouchers/?account_id=0000');
      })
      .then(function (res) {
        helpers.api.listed(res, 0);
        return agent.get('/vouchers/?project_id=' + voucher.project_id + '&reference=1');
      })
      .then(function (res) {
        helpers.api.listed(res, 2);
      })
      .catch(helpers.handler);
  });
});
