/* global expect, agent */

const helpers = require('./helpers');
const uuid = require('uuid/v4');

/*
 * The /vouchers API endpoint
 *
 * This test suit is about the vouchers table
 */
describe('(/vouchers) The vouchers HTTP endpoint', () => {
  const date = new Date();

  const vUuid = 'b140c144-6ca8-47b0-99ba-94732cf6efde';
  const numVouchers = 9;

  const TO_DELETE_UUID = '3688e9ce-85ea-4b5c-9144-688177edcb63';

  // balanced transaction with two lines (USD)
  const voucher = {
    date,
    uuid        : vUuid,
    project_id  : 1,
    currency_id : helpers.data.USD,
    amount      : 10,
    description : 'Voucher Transaction to BCDC',
    user_id     : 1,
    items       : [{
      uuid          : uuid(),
      account_id    : 184,
      debit         : 10,
      credit        : 0,
      document_uuid : uuid(),
      voucher_uuid  : vUuid,
    }, {
      account_id   : 217,
      debit        : 0,
      credit       : 10,
      voucher_uuid : vUuid,
    }],
  };

  // NOTE: this voucher does not have any uuids
  const items = [
    { account_id : 197, debit : 11, credit : 0, document_uuid : uuid(), entity_uuid : uuid() },
    { account_id : 191, debit : 0, credit : 11, document_uuid : uuid(), entity_uuid : uuid() },
    { account_id : 197, debit : 0, credit : 12 },
    { account_id : 190, debit : 12, credit : 0 },
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
    uuid        : uuid(),
    project_id  : 1,
    currency_id : helpers.data.USD,
    amount      : 10,
    description : 'Voucher Transaction',
    items       : [{
      uuid       : uuid(),
      account_id : 177,
      debit      : 10,
      credit     : 0,
    }],
  };

  // this voucher will not have an exchange rate
  const predatedVoucher = {
    uuid        : uuid(),
    date        : new Date('2000-01-01'),
    project_id  : 1,
    currency_id : helpers.data.FC,
    amount      : 10,
    description : 'Voucher Transaction',
    user_id     : 1,
    items       : [{
      uuid       : uuid(),
      account_id : 179,
      debit      : 10,
      credit     : 0,
    }, {
      uuid       : uuid(),
      account_id : 191,
      debit      : 0,
      credit     : 10,
    }],
  };

  let mockVoucher;

  it('POST /vouchers create a new voucher record in voucher and voucher_item tables', () => {
    return agent.post('/vouchers')
      .send({ voucher })
      .then((res) => {
        helpers.api.created(res);
        expect(res.body.uuid).to.be.equal(voucher.uuid);
      })
      .catch(helpers.handler);
  });

  it('POST /vouchers create a new voucher record with multiple voucher_items', () => {
    return agent.post('/vouchers')
      .send({ voucher : secondVoucher })
      .then((res) => {
        helpers.api.created(res);
      })
      .catch(helpers.handler);
  });

  it('POST /vouchers doesn\'t register when missing data', () => {
    const uid = uuid();
    mockVoucher = {
      date,
      uuid          : uid,
      project_id    : 1,
      currency_id   : 1,
      amount        : 10,
      description   : 'Bad Voucher Transaction',
      document_uuid : uuid(), // technically, this should reference something..
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

  it('POST /vouchers will reject a voucher will less than two records', () => {
    // attempt 1 - missing items completely + bad voucher
    return agent.post('/vouchers')
      .send({ voucher: { uuid: uuid() } })
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

  it('POST /vouchers will reject a voucher with an invalid exchange rate', () => {
    return agent.post('/vouchers')
      .send({ voucher: predatedVoucher })
      .then((res) => {
        helpers.api.errored(res, 400);
        expect(res.body.code).to.equal('ERRORS.NO_FISCAL_YEAR');
      })
      .catch(helpers.handler);
  });

  it('GET /vouchers?detailed=1 returns a list of vouchers', () => {
    return agent.get('/vouchers?detailed=1')
      .then((res) => {
        helpers.api.listed(res, numVouchers);
      })
      .catch(helpers.handler);
  });

  it('GET /vouchers/:uuid returns a detail of a specified vouchers', () => {
    return agent.get(`/vouchers/${voucher.uuid}`)
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.not.be.empty;
        expect(res.body.uuid).to.exist;
        expect(res.body.uuid).to.be.equal(voucher.uuid);
      })
      .catch(helpers.handler);
  });

  it('GET /vouchers/:uuid returns a NOT FOUND (404) when unknown {uuid}', () => {
    return agent.get('/vouchers/unknown')
      .then((res) => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });

  it('GET /vouchers returns a list of vouchers specified by query string', () => {
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


  it('DELETE /transactions/:uuid deletes a voucher', () => {
    return agent.delete(`/transactions/${TO_DELETE_UUID}`)
      .then(res => {
        expect(res).to.have.status(201);
        return agent.get(`/vouchers/${TO_DELETE_UUID}`);
      })
      .then(res => {
        helpers.api.errored(res, 404);
      })
      .catch(helpers.handler);
  });
});
