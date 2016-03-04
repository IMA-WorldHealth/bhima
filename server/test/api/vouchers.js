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
* BE SURE : run mysql in sql_mode = "STRICT_ALL_TABLES"
*/

describe('The /vouchers HTTP endpoint ::', function () {
  'use strict';

  var agent = chai.request.agent(helpers.baseUrl);

  /** login before each request */
  beforeEach(helpers.login(agent));

  /** Test with dates */
  var date = new Date();

  var voucher = {
    uuid : uuid.v4(),
    date : date,
    project_id : 1,
    reference : 'TPA1',
    currency_id : 1,
    amount : 10,
    description : 'Voucher transaction',
    document_uuid : uuid.v4(),
    user_id : 1
  };

  var voucherItem = {
    uuid : uuid.v4(),
    account_id : 3631,
    debit : 10,
    credit : 0,
    voucher_uuid : voucher.uuid
  };

  var secondVoucher = {
    uuid : uuid.v4(),
    date : date,
    project_id : 1,
    reference : 'TPA1',
    currency_id : 1,
    amount : 17,
    description : 'Multiple Voucher transaction',
    document_uuid : uuid.v4(),
    user_id : 1
  };

  var secondVoucherItemArray = [
    [uuid.v4(), 3631, 11, 0, secondVoucher.uuid],
    [uuid.v4(), 3637, 0, 11, secondVoucher.uuid],
    [uuid.v4(), 3627, 0, 12, secondVoucher.uuid],
    [uuid.v4(), 3628, 12, 0, secondVoucher.uuid]
  ];

  var mock = {};

  var allVouchers = [];

  it('POST /vouchers create a new voucher record in voucher and voucher_item tables', function () {
    /** data to send must be in this forma : */
    var data = { voucher : voucher, voucher_item : voucherItem };

    return agent.post('/vouchers')
      .send(data)
      .then(function (res) {
        expect(res).to.have.status(201);
        expect(res.body.id).to.exist;
        expect(res.body.id).to.be.equal(voucher.uuid);
      })
      .catch(helpers.handler);
  });

  it('POST /vouchers create a new voucher record with multiple voucher_items', function () {
    /** data to send must be in this forma : */
    var data = { voucher : secondVoucher, voucher_item : secondVoucherItemArray };

    return agent.post('/vouchers')
      .send(data)
      .then(function (res) {
        expect(res).to.have.status(201);
        expect(res.body.id).to.exist;
        expect(res.body.id).to.be.equal(data.voucher.uuid);
      })
      .catch(helpers.handler);
  });

  it('POST /vouchers dont register when missing data', function () {
    var mockVoucher = {
      uuid : uuid.v4(),
      date : date,
      project_id : 1,
      reference : 'TPA1',
      currency_id : 1,
      amount : 10,
      description : 'Voucher transaction',
      document_uuid : uuid.v4(),
      user_id : 1
    };

    var mockVoucherItem = {
      // Missing voucher item uuid
      account_id : 3631,
      debit : 10,
      credit : 0,
      voucher_uuid : mockVoucher.uuid
    };

    mock = { voucher : mockVoucher, voucher_item : mockVoucherItem };

    return agent.post('/vouchers')
      .send(mock)
      .then(function (res) {
        expect(res).to.have.status(400);
        expect(res.body.code).to.exist;
        expect(res.body.code).to.be.equal('DB.ER_NO_DEFAULT_FOR_FIELD');
      })
      .catch(helpers.handler);
  });

  it('GET /vouchers returns a list of vouchers', function () {
    return agent.get('/vouchers')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        allVouchers = res.body;
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

  it('GET /vouchers returns a list of vouchers pecified by query string', function () {
    return agent.get('/vouchers/?reference=unknow')
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
        return agent.get('/vouchers/?document_uuid=' + voucher.document_uuid + '&reference=unknow');
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.be.empty;
        return agent.get('/vouchers/?document_uuid=' + voucher.document_uuid + '&reference=TPA1');
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(res.body).to.have.length(1);
        return agent.get('/vouchers/?project_id=' + voucher.project_id + '&reference=TPA1');
      })
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(res.body).to.have.length(allVouchers.length);
      })
      .catch(helpers.handler);
  });


});
