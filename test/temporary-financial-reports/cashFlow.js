/* global expect, chai, agent */
const expect = require('chai').expect;
const _ = require('lodash');

describe('Cash Flow Report', () => {

  const reportURL = '/reports/finance/cashflow';

  const year2016 = { 
    account_id: '190',
    cashbox: '4',
    dateFrom: '2016-01-01',
    dateTo: '2016-12-31',
    lang: 'fr',
    renderer: 'json',
    reportId: '1',
    saveReport: '0',
    weekly: '0' 
  };

  const may2015 = { 
    account_id: '190',
    cashbox: '4',
    dateFrom: '2015-05-01',
    dateTo: '2015-05-31',
    lang: 'fr',
    renderer: 'json',
    reportId: '1',
    saveReport: '0',
    weekly: '1' 
  };

  var periodicBalance = {
    jan : 1131.42,
    feb : 1061.45,
    mar : 991.54,
    apr : 924.43,
    may : 855.96,
    jun : 786.43,
    jul : 717.27,
    aug : 650.88,
    sep : 637.87,
    oct : 568.47,
    nov : 498.82,
    dec :  429.12
  }

  var totalIncomes = {
    jan : 1.7,
    feb : 0.03,
    mar : 0.09,
    apr : 2.89,
    may : 1.53,
    jun : 0.47,
    jul : 0.84,
    aug : 3.61,
    sep : 56.99,
    oct : 0.6,
    nov : 0.35,
    dec : 0.3
  }

  var totalExpenses = {
    jan : 70,
    feb : 70,
    mar : 70,
    apr : 70,
    may : 70,
    jun : 70,
    jul : 70,
    aug : 70,
    sep : 70,
    oct : 70,
    nov : 70,
    dec : 70,
  }

  var periodicOpenningBalance = {
    jan : 1199.72,
    feb : 1131.42,
    mar : 1061.45,
    apr : 991.54,
    may : 924.43,
    jun : 855.96,
    jul : 786.43,
    aug : 717.27,
    sep : 650.88,
    oct : 637.87,
    nov : 568.47,
    dec : 498.82,
  };

  var periodicBalanceWeek = { 
    'week1' : 1728.68,
    'week2' : 1728.68,
    'week3' : 1658.68,
    'week4' : 1658.68,
    'week5' : 1658.68, 
  };

  var periodicOpenningBalanceWeek = { 
    'week1' : 1728.68,
    'week2' : 1728.68,
    'week3' : 1728.68,
    'week4' : 1658.68,
    'week5' : 1658.68, 
  };

  var totalIncomesWeek = { 
    'week6': 22.94 
  };
  
  var totalExpensesWeek = { 
    'week3': 70 
  };

  var openningBalance = '1728.68';

  // Cash Flow Report for the 'Hospital Primary Cashbox' with the currency Dollars in 2016
  it('Returns expected Cash Flow Report for the Hospital Primary Cashbox with the currency Dollars in 2016', () => {
    return agent.get(reportURL)
      .query(year2016)
      .then((result) => {
        expect(Number((result.body.periodicBalance['2016-01-01']).toFixed(2))).to.equal(periodicBalance.jan);
        expect(Number((result.body.periodicBalance['2016-06-01']).toFixed(2))).to.equal(periodicBalance.jun);
        expect(Number((result.body.periodicBalance['2016-09-01']).toFixed(2))).to.equal(periodicBalance.sep);
        expect(Number((result.body.periodicBalance['2016-12-01']).toFixed(2))).to.equal(periodicBalance.dec);

        expect(Number((result.body.totalIncomes['2016-04-01']).toFixed(2))).to.equal(totalIncomes.apr);
        expect(Number((result.body.totalIncomes['2016-06-01']).toFixed(2))).to.equal(totalIncomes.jun);
        expect(Number((result.body.totalIncomes['2016-11-01']).toFixed(2))).to.equal(totalIncomes.nov);
        expect(Number((result.body.totalIncomes['2016-12-01']).toFixed(2))).to.equal(totalIncomes.dec);

        expect(Number((result.body.totalExpenses['2016-01-01']).toFixed(2))).to.equal(totalExpenses.jan);
        expect(Number((result.body.totalExpenses['2016-03-01']).toFixed(2))).to.equal(totalExpenses.mar);
        expect(Number((result.body.totalExpenses['2016-07-01']).toFixed(2))).to.equal(totalExpenses.jul);
        expect(Number((result.body.totalExpenses['2016-10-01']).toFixed(2))).to.equal(totalExpenses.oct);

        expect(Number(result.body.periodicOpenningBalance['2016-01-01'])).to.equal(periodicOpenningBalance.jan);
        expect(Number(result.body.periodicOpenningBalance['2016-05-01'])).to.equal(periodicOpenningBalance.may);
        expect(Number(result.body.periodicOpenningBalance['2016-08-01'])).to.equal(periodicOpenningBalance.aug);
        expect(Number(result.body.periodicOpenningBalance['2016-11-01'])).to.not.equal(periodicOpenningBalance.dec);
      });
  });

  //Cash Flow Report for the 'Hospital Primary Cashbox' with the currency Dollars in May 2015
  it('Returns expected the Weekly Cash Flow Report for the Hospital Primary Cashbox with the currency Dollars in May 2005', () => {
    return agent.get(reportURL)
      .query(may2015)
      .then((result) => {
        expect(Number(result.body.openningBalance).toFixed(2)).to.equal(openningBalance);

        expect(Number((result.body.periodicBalance['2015-05-01']).toFixed(2))).to.equal(periodicBalanceWeek.week1);
        expect(Number((result.body.periodicBalance['2015-05-03']).toFixed(2))).to.equal(periodicBalanceWeek.week2);
        expect(Number((result.body.periodicBalance['2015-05-10']).toFixed(2))).to.equal(periodicBalanceWeek.week3);
        expect(Number((result.body.periodicBalance['2015-05-17']).toFixed(2))).to.equal(periodicBalanceWeek.week4);
        expect(Number((result.body.periodicBalance['2015-05-24']).toFixed(2))).to.equal(periodicBalanceWeek.week5);

        expect(Number(result.body.periodicOpenningBalance['2015-05-01'])).to.equal(periodicOpenningBalanceWeek.week1);
        expect(Number(result.body.periodicOpenningBalance['2015-05-03'])).to.equal(periodicOpenningBalanceWeek.week2);
        expect(Number(result.body.periodicOpenningBalance['2015-05-10'])).to.equal(periodicOpenningBalanceWeek.week3);
        expect(Number(result.body.periodicOpenningBalance['2015-05-17'])).to.equal(periodicOpenningBalanceWeek.week4);
        expect(Number(result.body.periodicOpenningBalance['2015-05-24'])).to.equal(periodicOpenningBalanceWeek.week5);


        expect(Number(result.body.totalIncomes['2015-05-31'])).to.equal(totalIncomesWeek.week6);
        expect(Number(result.body.totalExpenses['2015-05-10'])).to.equal(totalExpensesWeek.week3);
        expect(Number(result.body.totalExpenses['2015-05-10'])).to.not.equal(periodicBalanceWeek.week2);
      });
  });

});