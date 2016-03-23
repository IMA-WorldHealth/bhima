/* jshint expr: true */
var chai = require('chai');
var expect = chai.expect;

/** import test helpers */
var helpers = require('./helpers');
var uuid    = require('node-uuid');
helpers.configure(chai);

/**
* The /vouchers API endpoint
*
* @desc This test suit is about the vouchers transactions
*/
describe('The /vouchers HTTP endpoint', function () {
  'use strict';

  var agent = chai.request.agent(helpers.baseUrl);

  /** login before each request */
  beforeEach(helpers.login(agent));

  /** Test with dates */
  var date = new Date();

  // This should never actually happen in production (in balanced transactions),
  // but is a valid API test right now..
  /**
   * @todo - posting to the journal should reject this as unbalanced and
   * break this test.
   */
  var vUuid = uuid.v4();

  var voucher = {
    uuid : vUuid,
    date : date,
    project_id : 1,
    currency_id : 1,
    amount : 10,
    description : 'Voucher Transaction',
    document_uuid : uuid.v4(),
    user_id : 1,
    items : [{
      uuid : uuid.v4(),
      account_id : 3631,
      debit : 10,
      credit : 0,
      voucher_uuid : vUuid
    }]
  };

  // NOTE: this voucher does not have any uuids
  var items = [
    { account_id: 3631, debit: 11, credit: 0 },
    { account_id: 3637, debit: 0,  credit:11 },
    { account_id: 3627, debit: 0,  credit:12 },
    { account_id: 3628, debit: 12, credit: 0 }
  ];

  var secondVoucher = {
    date : date,
    project_id : 1,
    currency_id : 1,
    amount : 23,
    description : 'Multiple Voucher Transaction',
    document_uuid : uuid.v4(),
    user_id : 1,
    items : items
  };

  var mockVoucher;

  it('POST /vouchers create a new voucher record in voucher and voucher_item tables', function () {
    return agent.post('/vouchers')
      .send({ voucher : voucher })
      .then(function (res) {
        expect(res).to.have.status(201);
        expect(res.body.uuid).to.exist;
        expect(res.body.uuid).to.be.equal(voucher.uuid);
      })
      .catch(helpers.handler);
  });

  it('POST /vouchers create a new voucher record with multiple voucher_items', function () {
    return agent.post('/vouchers')
      .send({ voucher : secondVoucher })
      .then(function (res) {
        expect(res).to.have.status(201);
        expect(res.body.uuid).to.exist;
      })
      .catch(helpers.handler);
  });

  it('POST /vouchers dont register when missing data', function () {
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
        expect(res).to.have.status(400);
        expect(res.body.code).to.exist;
        expect(res.body.code).to.be.equal('DB.ER_BAD_NULL_ERROR');
      })
      .catch(helpers.handler);
  });

  it('GET /vouchers returns a list of vouchers', function () {
    return agent.get('/vouchers')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
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
        expect(res).to.have.status(404);
        expect(res.body.code).to.exist;
        expect(res.body.code).to.be.equal('ERR_NOT_FOUND');
      })
      .catch(helpers.handler);
  });

  it('GET /vouchers returns a list of vouchers specified by query string', function () {
    return agent.get('/vouchers/?reference=unknown')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.be.empty;
        return agent.get('/vouchers/?account_id=0000');
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.be.empty;
        return agent.get('/vouchers/?document_uuid=' + voucher.document_uuid);
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        return agent.get('/vouchers/?document_uuid=' + voucher.document_uuid + '&reference=unknown');
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.be.empty;
        return agent.get('/vouchers/?document_uuid=' + voucher.document_uuid + '&reference=1');
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(res.body).to.have.length(1);
        return agent.get('/vouchers/?project_id=' + voucher.project_id + '&reference=1');
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(res.body).to.have.length(1);
      })
      .catch(helpers.handler);
  });


});
