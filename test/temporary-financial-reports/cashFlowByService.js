/* global expect, chai, agent */
const expect = require('chai').expect;
const _ = require('lodash');

describe('Cash Flow Report', () => {

  const reportURL = '/reports/finance/cashflow/services';

  const year2015 = {
    dateFrom  : '2015-01-01',
    dateTo    : '2015-12-31',
    renderer  : 'json'
  };

  var pediatrieCP1 = 3.49;
  var adminisCP5 = 22.94;
  var totalCashAdmin = 32.04;
  var totalCashMI = 3.89;
  var totalPediatrie = 3.79;
  var totalCashIncome = 39.72;


  // Report Cash Flow by Service in 2015
  it('Returns expected Cash Flow by Service in 2015', () => {
    return agent.get(reportURL)
      .query(year2015)
      .then((result) => {
        expect(Number(result.body.matrix[0][4])).to.equal(pediatrieCP1);
        expect(Number(result.body.matrix[4][2])).to.equal(adminisCP5);

        expect(Number(result.body.aggregates[0].totalCashIncome)).to.equal(totalCashAdmin);
        expect(Number(result.body.aggregates[1].totalCashIncome)).to.equal(totalCashMI);
        expect(Number(result.body.aggregates[2].totalCashIncome)).to.equal(totalPediatrie);
        expect(Number(result.body.aggregates[3].totalCashIncome)).to.equal(totalCashIncome);

        expect(Number(result.body.aggregates[3].totalCashIncome)).to.not.equal(adminisCP5);

      });
  });
});