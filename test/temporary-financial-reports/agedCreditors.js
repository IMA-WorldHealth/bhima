/* global expect, chai, agent */
const expect = require('chai').expect;
const _ = require('lodash');

describe('Aged Creditors', () => {

  const reportURL = '/reports/finance/creditors/aged';

  const january2016 = { 
    date: '2016-01-31',
    reportId: '10',
    zeroes: '0',
    renderer : 'json',
  };

  const june2015 = { 
    date: '2015-05-31',
    reportId: '10',
    zeroes: '1',
    renderer : 'json',
  };

  // Aged Creditors report during the period January 2016
  it('Returns expected Aged creditors report during the period January 2016', () => {
    return agent.get(reportURL)
      .query(january2016)
      .then((result) => {

        const regidesoThirty = 10;
        const regidesoExcess = 100; 

        const report = result.body;

        expect(Number(report.creditors[0].thirty)).to.equal(regidesoThirty);
        expect(Number(report.creditors[0].excess)).to.equal(regidesoExcess);
        expect(Number(report.creditors[0].total)).to.not.equal(regidesoExcess);
      });

  });

  // Aged creditors report during the period June 2015
  it('Returns expected Aged creditors report during the period June 2015', () => {
    return agent.get(reportURL)
      .query(june2015)
      .then((result) => {         
        const snelSixty = 10;
        const snelNinety = 10;
        const snelExcess = 20;
        const snelTotal = 50;

        const report = result.body;

        expect(Number(report.creditors[1].sixty)).to.equal(snelSixty);
        expect(Number(report.creditors[1].ninety)).to.equal(snelNinety);
        expect(Number(report.creditors[1].excess)).to.equal(snelExcess);
        expect(Number(report.creditors[1].total)).to.equal(snelTotal);        
      });
  });

});
