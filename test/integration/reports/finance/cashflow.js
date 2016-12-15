/* global expect, chai, agent */
/* jshint expr: true */
'use strict';

const helpers = require('../../helpers');
const target = '/reports/finance/cashflow';

describe(`(${target}) Cashflow Reports`, function () {

  const parameters = {
    account_id: 3627,
    dateFrom: '2016-01-01',
    dateTo: '2016-12-31',
    renderer : 'json'
  };

  const keys = [
    'dateFrom', 'dateTo', 'incomes', 'expenses', 'summationIncome', 'summationExpense',
    'sum_incomes', 'sum_expense', 'periodicBalance', 'periodicOpenningBalance',
    'incomesLabels', 'expensesLabels', 'totalIncomes', 'totalExpenses', 'periodicData',
    'openningBalance', 'accountName', 'periodStartArray'
  ];

  const BAD_REQUEST = 'ERRORS.BAD_REQUEST';
  const BAD_DATE_INTERVAL = 'ERRORS.BAD_DATE_INTERVAL';

  const clone = (object) => JSON.parse(JSON.stringify(object));

  it(`GET ${target} should return a BAD_REQUEST response`, function () {
    return agent.get('/reports/finance/cashflow')
      .then(res => {
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body.code).to.equal(BAD_REQUEST);
      })
      .catch(helpers.handler);
  });

  // TODO: remove this test
  // default date value is the current date if no dates given
  it.skip(`GET ${target}?account_id=3627 should return a BAD_DATE_INTERVAL response`, function () {
    return agent.get(target)
      .query({ account_id : parameters.account_id })
      .then(res => {
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body.code).to.equal(BAD_DATE_INTERVAL);
      })
      .catch(helpers.handler);
  });

  it(`GET ${target} should return JSON data for 'JSON' rendering target`, function () {
    return agent.get(target)
      .query(parameters)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.contain.all.keys(keys);
        expect(res.body.dateFrom).to.be.equal(parameters.dateFrom);
        expect(res.body.dateTo).to.be.equal(parameters.dateTo);
      })
      .catch(helpers.handler);
  });

  it(`GET ${target} should return HTML data for HTML rendering target`, function () {
    let copy = clone(parameters);
    copy.renderer = 'html';

    return agent.get(target)
      .query(copy)
      .then(function (res) {
        expect(res.headers['content-type']).to.equal('text/html; charset=utf-8');
        expect(res.text).to.not.be.empty;
      })
      .catch(helpers.handler);
  });

  it(`GET ${target} should return PDF data for PDF rendering target`, function () {

    let copy = clone(parameters);
    copy.renderer = 'pdf';

    return agent.get(target)
      .query(copy)
      .then(function (res) {
        expect(res.headers['content-type']).to.equal('application/pdf');
        expect(res.type).to.equal('application/pdf');
      })
      .catch(helpers.handler);
  });
});
