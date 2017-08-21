/* global expect, chai, agent */
const expect = require('chai').expect;
const _ = require('lodash');

describe('Open Debtors Report', () => {

  const reportURL = '/reports/finance/debtors/open';

  const dataSet = { 
    order: 'patient-name-asc',
    lang: 'fr',
    renderer: 'json',
    reportId: '8',
    saveReport: '0'
  };

  var debtPaHsp5 = 0.72;
  var aggregates = {
    numDebtors: 17,
    balance: 166.4337, 
  };

  it('Returns expected Open Debtor Report ', () => {
    return agent.get(reportURL)
      .query(dataSet)
      .then((result) => {
        expect(Number(result.body.debtors[5].balance)).to.equal(debtPaHsp5);
        expect(result.body.aggregates.numDebtors).to.equal(aggregates.numDebtors);
        expect(result.body.aggregates.balance).to.equal(aggregates.balance);
        expect(result.body.aggregates.balance).to.not.equal(debtPaHsp5);      
      });
  });


});