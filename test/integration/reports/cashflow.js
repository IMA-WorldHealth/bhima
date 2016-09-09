/* global expect, chai, agent */

const helpers = require('../helpers');

describe('(/reports/finance/cashflow) Cashflow Reports :: ', function () {

  const parameters = {
    accountId: 3627,
    dateFrom: '2016-01-01',
    dateTo: '2016-12-31'
  };
  const keys = [
    'dateFrom', 'dateTo', 'incomes', 'expenses', 'summationIncome', 'summationExpense',
    'sum_incomes', 'sum_expense', 'periodicBalance', 'periodicOpenningBalance',
    'incomesLabels', 'expensesLabels', 'totalIncomes', 'totalExpenses', 'periodicData',
    'openningBalance', 'accountName', 'periodStartArray'
  ];
  const BAD_REQUEST = 'ERRORS.BAD_REQUEST';
  const BAD_DATE_INTERVAL = 'ERRORS.BAD_DATE_INTERVAL';

  it('GET /reports/finance/cashflow should return a BAD_REQUEST response', function () {
    return agent.get('/reports/finance/cashflow')
      .then(res => {
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body.code).to.equal(BAD_REQUEST);
      })
      .catch(helpers.handler);
  });

  it('GET /reports/finance/cashflow?account_id=3627 should return a BAD_DATE_INTERVAL response', function () {

    let param = `account_id=${parameters.accountId}`;

    return agent.get('/reports/finance/cashflow?' + param)
      .then(res => {
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body.code).to.equal(BAD_DATE_INTERVAL);
      })
      .catch(helpers.handler);
  });

  it('GET /reports/finance/cashflow should return JSON data for `JSON` rendering target', function () {

    let param = `account_id=${parameters.accountId}&dateFrom=${parameters.dateFrom}&dateTo=${parameters.dateTo}`;
    let renderer = '&renderer=json'

    return agent.get('/reports/finance/cashflow?' + param + renderer)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.model.data).to.contain.all.keys(keys);
        expect(res.body.model.data.dateFrom).to.be.equal(parameters.dateFrom);
        expect(res.body.model.data.dateTo).to.be.equal(parameters.dateTo);
      })
      .catch(helpers.handler);
  });

  it('GET /reports/finance/cashflow should return HTML data for `HTML` rendering target', function () {

    let param = `account_id=${parameters.accountId}&dateFrom=${parameters.dateFrom}&dateTo=${parameters.dateTo}`;
    let renderer = '&renderer=html'

    return agent.get('/reports/finance/cashflow?' + param + renderer)
      .then(function (res) {
        expect(res.headers['content-type']).to.equal('text/html; charset=utf-8');
        expect(res.text).to.not.be.empty;
      })
      .catch(helpers.handler);
  });

  it('GET /reports/finance/cashflow should return PDF data for `PDF` rendering target', function () {

    let param = `account_id=${parameters.accountId}&dateFrom=${parameters.dateFrom}&dateTo=${parameters.dateTo}`;
    let renderer = '&renderer=pdf'

    return agent.get('/reports/finance/cashflow?' + param + renderer)
      .then(function (res) {
        expect(res.headers['content-type']).to.equal('application/pdf');
        expect(res.type).to.equal('application/pdf');
      })
      .catch(helpers.handler);
  });
});
