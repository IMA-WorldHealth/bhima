/* global expect, chai, agent */

const helpers = require('./helpers');
const uuid = require('node-uuid');

/*
 * The /vouchers API endpoint
 *
 * This test suit is about the vouchers table
 */
describe('(/vouchers) The vouchers HTTP endpoint', function () {
  const date = new Date();

  const vUuid = 'b140c144-6ca8-47b0-99ba-94732cf6efde';
  const numVouchers = 6;

  // balanced transaction with two lines (USD)
  const voucher = {
    date,
    uuid        : vUuid,
    project_id  : 1,
    currency_id : helpers.data.USD,
    amount      : 10,
    description : 'Voucher Transaction',
    user_id     : 1,
    items       : [{
      uuid          : uuid.v4(),
      account_id    : 3631,
      debit         : 10,
      credit        : 0,
      document_uuid : uuid.v4(),
      voucher_uuid  : vUuid,
    }, {
      account_id   : 3628,
      debit        : 0,
      credit       : 10,
      voucher_uuid : vUuid,
    }],
  };

  // NOTE: this voucher does not have any uuids
  const items = [
    { account_id: 3631, debit: 11, credit: 0, document_uuid: uuid.v4(), entity_uuid: uuid.v4() },
    { account_id: 3637, debit: 0, credit: 11, document_uuid: uuid.v4(), entity_uuid: uuid.v4() },
    { account_id: 3631, debit: 0, credit: 12 },
    { account_id: 3628, debit: 12, credit: 0 },
  ];

  const secondVoucher = {
    date,
    items,
    project_id  : 1,
    currency_id : helpers.data.USD,
    amount      : 23,
    description : 'Multiple Voucher Transaction',
    user_id     : 1,
  };

  // only one item - bad transaction
  const badVoucher = {
    date,
    uuid        : uuid.v4(),
    project_id  : 1,
    currency_id : helpers.data.USD,
    amount      : 10,
    description : 'Voucher Transaction',
    items       : [{
      uuid       : uuid.v4(),
      account_id : 3631,
      debit      : 10,
      credit     : 0,
    }],
  };

  // this voucher will not have an exchange rate
  const predatedVoucher = {
    uuid        : uuid.v4(),
    date        : new Date('2000-01-01'),
    project_id  : 1,
    currency_id : helpers.data.FC,
    amount      : 10,
    description : 'Voucher Transaction',
    user_id     : 1,
    items       : [{
      uuid       : uuid.v4(),
      account_id : 3627,
      debit      : 10,
      credit     : 0,
    }, {
      uuid       : uuid.v4(),
      account_id : 3637,
      debit      : 0,
      credit     : 10,
    }],
  };

  let mockVoucher;

  it('POST /vouchers create a new voucher record in voucher and voucher_item tables', function () {
    return agent.post('/vouchers')
      .send({ voucher })
      .then((res) => {
        helpers.api.created(res);
        expect(res.body.uuid).to.be.equal(voucher.uuid);
      })
      .catch(helpers.handler);
  });

  it('POST /vouchers create a new voucher record with multiple voucher_items', function () {
    return agent.post('/vouchers')
      .send({ voucher: secondVoucher })
      .then((res) => {
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  it('POST /vouchers doesn\'t register when missing data', function () {
    const uid = uuid.v4();
    mockVoucher = {
      date,
      uuid          : uid,
      project_id    : 1,
      currency_id   : 1,
      amount        : 10,
      description   : 'Bad Voucher Transaction',
      document_uuid : uuid.v4(), // technically, this should reference something..
      user_id       : 1,
      items         : [{
        account_id   : 3631,
        // missing debit field
        credit       : 0,
        voucher_uuid : uid,
      }],
    };

    return agent.post('/vouchers')
      .send({ voucher : mockVoucher })
      .then((res) => {
        helpers.api.errored(res, 400);
      })
      .catch(helpers.handler);
  });

  it('POST /vouchers will reject a voucher will less than two records', function () {
    // attempt 1 - missing items completely + bad voucher
    return agent.post('/vouchers')
      .send({ voucher: { uuid: uuid.v4() } })
      .then((res) => {
        helpers.api.errored(res, 400);

    // attempt 2 - only a single item
        return agent.post('/vouchers')
          .send({ voucher: badVoucher });
      })
      .then((res) => {
        helpers.api.errored(res, 400);
      })
      .catch(helpers.handler);
  });

  it('POST /vouchers will reject a voucher with an invalid exchange rate', function () {
    return agent.post('/vouchers')
    .send({ voucher: predatedVoucher })
    .then((res) => {
      helpers.api.errored(res, 400);
      expect(res.body.code).to.equal('ERRORS.NO_FISCAL_YEAR');
    })
    .catch(helpers.handler);
  });

  it('GET /vouchers?detailed=1 returns a list of vouchers', function () {
    return agent.get('/vouchers?detailed=1')
      .then((res) => {
        helpers.api.listed(res, numVouchers);
      })
      .catch(helpers.handler);
  });

  it('GET /vouchers/:uuid returns a detail of a specified vouchers', function () {
    return agent.get(`/vouchers/${voucher.uuid}`)
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(res.body.uuid).to.exist;
        expect(res.body.uuid).to.be.equal(voucher.uuid);
      })
      .catch(helpers.handler);
  });

  it('GET /vouchers/:uuid returns a NOT FOUND (404) when unknown {uuid}', function () {
    return agent.get('/vouchers/unknown')
      .then((res) => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('GET /vouchers returns a list of vouchers specified by query string', function () {
    return agent.get('/vouchers/?reference=unknown&detailed=1')
      .then((res) => {
        helpers.api.listed(res, 0);
        return agent.get('/vouchers/?account_id=0000&detailed=1');
      })
      .then((res) => {
        helpers.api.listed(res, 0);
        return agent.get(`/vouchers/?project_id=${voucher.project_id}&reference=VO.TPA.1&detailed=1`);
      })
      .then((res) => {
        helpers.api.listed(res, 1);
      })
      .catch(helpers.handler);
  });
});
