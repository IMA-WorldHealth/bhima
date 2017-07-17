/* global expect, chai, agent */
const expect = require('chai').expect;
const _ = require('lodash');

describe('Aged debtors Report', () => {

  const reportURL = '/reports/finance/debtors/aged';

  const january2017 = { 
    date: '2017-01-31',
    reportId: '5',
    zeroes: '0',
    renderer : 'json',
  };

  const june2015 = { 
    date: '2015-06-30',
    reportId: '5',
    zeroes: '1',
    renderer : 'json',
  };

  // Aged debtors report during the period January 2017
  it('Returns expected Aged debtors report during the period January 2017', () => {
    return agent.get(reportURL)
      .query(january2017)
      .then((result) => {
        const totalGuestHouse = 4.52;
        const totalRegideso30To60 = 25.8038;
        const report = result.body;

        expect(Number(report.debtors[0].total)).to.equal(totalGuestHouse);
        expect(Number(report.debtors[3].sixty)).to.equal(totalRegideso30To60);

      });

  });

  // Aged debtors report during the period June 2015
  it('Returns expected Aged debtors report during the period June 2015', () => {
    return agent.get(reportURL)
      .query(june2015)
      .then((result) => {
        const totalPatientPayantCashThirty = -1.0084;
        const totalPatientPayantCashNinety = 3.8880;
        const totalPatientPayantCashExcess = 1.9671;
        const totalAggregates = 61.8371;

        const report = result.body;

        expect(Number(report.debtors[0].thirty)).to.equal(totalPatientPayantCashThirty);
        expect(Number(report.debtors[0].ninety)).to.equal(totalPatientPayantCashNinety);
        expect(Number(report.debtors[0].excess)).to.equal(totalPatientPayantCashExcess);

        expect(Number(report.aggregates.total)).to.not.equal(4500);
        expect(Number(report.aggregates.total)).to.equal(totalAggregates);
      });
  });

});
