/* global expect, chai, agent */
const expect = require('chai').expect;
const _ = require('lodash');

describe('Open Debtors Report', () => {

  const reportURL = '/reports/finance/debtors/open';

  const dataSet = { 
    source: 'patient-name-asc',
    lang: 'fr',
    renderer: 'json',
    reportId: '8',
    saveReport: '0'
  };

  var debtPaHsp9 = 0.72;
  var aggregates = {
    numDebtors: 13,
    debit: 146.6802,
    credit: 89.3665,
    balance: 57.3137 
  };

  it('Returns expected Open Debtor Report ', () => {
    return agent.get(reportURL)
      .query(dataSet)
      .then((result) => {
        expect(Number(result.body.debtors[12].debt)).to.equal(debtPaHsp9);

        expect(result.body.aggregates.numDebtors).to.equal(aggregates.numDebtors);
        expect(result.body.aggregates.debit).to.equal(aggregates.debit);
        expect(result.body.aggregates.credit).to.equal(aggregates.credit);
        expect(result.body.aggregates.balance).to.equal(aggregates.balance);
        expect(result.body.aggregates.balance).to.not.equal(debtPaHsp9);
      
      });
  });


});