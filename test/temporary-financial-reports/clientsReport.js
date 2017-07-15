/* global expect, chai, agent */
const expect = require('chai').expect;
const _ = require('lodash');

describe('Clients Report', () => {

  const reportURL = '/reports/finance/clientsReport';

  const currentYearRequest = {
    dateFrom : '2017-01-01',
    dateTo : '2017-12-31',
    detailPrevious : 'false',
    lang : 'fr',
    renderer : 'json',
    reportId : 9,
    saveReport : 0
  };

  const currentYearWithoutRegidesoRequest = {
    dateFrom : '2017-01-01',
    dateTo : '2017-12-31',
    ignoredClients : '650cc2dc-60ac-4e39-b873-cbf65e6c61aa',
    detailPrevious : 'false',
    lang : 'fr',
    renderer : 'json',
    reportId : 9,
    saveReport : 0
  };

  const simpleReportCurrentYear = {
    simplePreview : 'true',
    lang : 'fr',
    renderer : 'json',
    reportId : 9,
    saveReport : 0    
  };

  const simpleReportCurrentYearWithoutREGIDESO = {
    ignoredClients : '650cc2dc-60ac-4e39-b873-cbf65e6c61aa',
    simplePreview : 'true',
    lang : 'fr',
    renderer : 'json',
    reportId : 9,
    saveReport : 0    
  };

  it('Returns expected data for the fiscal year 2017', () => {
    const previousTotalDebit = 166.4337;
    const previousTotalCredit =  109.12;
    const previousBalance = 57.3137;

    const currentTotalDebit = 0;
    const currentTotalCredit = 0;
    const currentBalance = 0;

    const finalBalance = 57.3137; 

    const totalLines = 4;

    return agent.get(reportURL)
      .query(currentYearRequest)
      .then((result) => {
        const report = result.body;

        expect(Number(report.totalInitDebit)).to.equal(previousTotalDebit);
        expect(Number(report.totalInitCredit)).to.equal(previousTotalCredit);
        expect(Number(report.totalInitBalance)).to.equal(previousBalance);

        expect(Number(report.totalCurrentDebit)).to.equal(currentTotalDebit);
        expect(Number(report.totalCurrentCredit)).to.equal(currentTotalCredit);
        expect(Number(report.totalCurrentBalance)).to.equal(currentBalance);

        expect(Number(report.totalFinalBalance)).to.equal(finalBalance);
        expect(Number(Object.keys(report.lines).length)).to.equal(totalLines);
      });
  });

  it('Returns expected data for the fiscal year 2017 when RESIDESO is skipped', () => {
    const previousTotalDebit = 125.8382;
    const previousTotalCredit =  95.3083;
    const previousBalance = 30.5299;

    const currentTotalDebit = 0;
    const currentTotalCredit = 0;
    const currentBalance = 0;

    const totalBalance = 30.5299;

    const totalLines = 3;

    return agent.get(reportURL)
      .query(currentYearWithoutRegidesoRequest)
      .then((result) => {
        const report = result.body;

        expect(Number(report.totalInitDebit)).to.equal(previousTotalDebit);
        expect(Number(report.totalInitCredit)).to.equal(previousTotalCredit);
        expect(Number(report.totalInitBalance)).to.equal(previousBalance);

        expect(Number(report.totalCurrentDebit)).to.equal(currentTotalDebit);
        expect(Number(report.totalCurrentCredit)).to.equal(currentTotalCredit);
        expect(Number(report.totalCurrentBalance)).to.equal(currentBalance);

        expect(Number(report.totalFinalBalance)).to.equal(totalBalance);
        expect(Number(Object.keys(report.lines).length)).to.equal(totalLines);
      });
  });

  it('Returns expected data for a simple report preview', () => {
    const finalBalance = 57.3137;
    const totalLines = 4;

    return agent.get(reportURL)
      .query(simpleReportCurrentYear)
      .then((result) => {
        const report = result.body;

        expect(Number(report.totalBalance)).to.equal(finalBalance);
        expect(Number(Object.keys(report.lines).length)).to.equal(totalLines);
      });
  });

  it('Returns expected data for a simple report preview without REGIDESO', () => {
    const finalBalance = 30.5299;
    const totalLines = 3;

    return agent.get(reportURL)
      .query(simpleReportCurrentYearWithoutREGIDESO)
      .then((result) => {
        const report = result.body;

        expect(Number(report.totalBalance)).to.equal(finalBalance);
        expect(Number(Object.keys(report.lines).length)).to.equal(totalLines);
      });
  });   
});
