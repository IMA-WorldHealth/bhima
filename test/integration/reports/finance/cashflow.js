/* global expect, agent */

const helpers = require('../../helpers');

const target = '/reports/finance/cashflow';

describe(`(${target}) Cashflow Reports`, () => {
  const parameters = {
    cashboxesIds : [1],
    dateFrom : new Date('2018-01-01'),
    dateTo : new Date('2018-12-31'),
    renderer : 'json',
  };

  const keys = [
    'metadata',
    'incomes',
    'expenses',
    'transfers',
    'incomeTextKeys',
    'expenseTextKeys',
    'incomeTotalByTextKeys',
    'expenseTotalByTextKeys',
    'transferTotalByTextKeys',
    'incomeTotal',
    'expenseTotal',
    'transferTextKeys',
    'transferTotal',
    'totalPeriodColumn',
  ];

  const BAD_REQUEST = 'ERRORS.BAD_REQUEST';

  const clone = (object) => JSON.parse(JSON.stringify(object));

  it(`GET ${target} should return a BAD_REQUEST response`, () => {
    return agent.get('/reports/finance/cashflow')
      .then(res => {
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body.code).to.equal(BAD_REQUEST);
      })
      .catch(helpers.handler);
  });

  it(`GET ${target} should return JSON data for 'JSON' rendering target`, () => {
    return agent.get(target)
      .query(parameters)
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.contain.all.keys(keys);
        expect(res.body.dateFrom).to.be.equal(parameters.dateFrom.toISOString());
        expect(res.body.dateTo).to.be.equal(parameters.dateTo.toISOString());
      })
      .catch(helpers.handler);
  });

  it(`GET ${target} should return HTML data for HTML rendering target`, () => {
    const copy = clone(parameters);
    copy.renderer = 'html';

    return agent.get(target)
      .query(copy)
      .then((res) => {
        expect(res.headers['content-type']).to.equal('text/html; charset=utf-8');
        expect(res.text).to.not.be.empty;
      })
      .catch(helpers.handler);
  });

  it(`GET ${target} should return PDF data for PDF rendering target`, () => {
    const copy = clone(parameters);
    copy.renderer = 'pdf';

    return agent.get(target)
      .query(copy)
      .then((res) => {
        expect(res.headers['content-type']).to.equal('application/pdf');
        expect(res.type).to.equal('application/pdf');
      })
      .catch(helpers.handler);
  });
});
