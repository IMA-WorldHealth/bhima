/* global expect, chai, agent */
const expect = require('chai').expect;
const _ = require('lodash');

describe.only('Cash Flow Report', () => {

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

  // Cash Flow Report for the 'Hospital Primary Cashbox' with the currency Dollars in 2016
  it('Returns expected Cash Flow Report for the Hospital Primary Cashbox with the currency Dollars in 2016', () => {
    return agent.get(reportURL)
      .query(year2016)
      .then((result) => {
        var periodicBalance = {
          jan : -870.28,
          feb : -940.28,
          mar : -1010.28,
          apr : -1080.28,
          may : -1150.28,
          jun : -1220.28,
          jul : -1290.28,
          aug : -1360.28,
          sep : -1430.28,
          oct : -1500.28,
          nov : -1570.28,
          dec : -1640.28           
        };

        var periodicOpenningBalance = {
          jan : -800.28,
          feb : -870.28,
          mar : -940.28,
          apr : -1010.28,
          may : -1080.28,
          jun : -1150.28,
          jul : -1220.28,
          aug : -1290.28,
          sep : -1360.28,
          oct : -1430.28,
          nov : -1500.28,
          dec : -1570.28 
        };

        expect(Number(result.body.periodicBalance['2016-01-01'])).to.equal(periodicBalance.jan);
        expect(Number(result.body.periodicOpenningBalance['2016-12-01'])).to.equal(periodicOpenningBalance.dec);
        expect(Number(result.body.periodicOpenningBalance['2016-06-01'])).to.not.equal(periodicOpenningBalance.may);

      });
  });

});