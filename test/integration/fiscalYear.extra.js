/* global expect, agent */

const helpers = require('./helpers');

describe('(/fiscal) Fiscal Year extra operations', () => {
  const url = '/fiscal';
  const date = new Date('2017-08-24');

  const fiscalYearDetails = {
    id : 3,
    enterprise_id : 1,
    label : 'Test Fiscal Year 2017',
  };

  const accounts = [
    { id : 81, debit : 77, credit : 0 },
    { id : 83, debit : 0, credit : 77 },
    { id : 174, debit : 23, credit : 0 },
    { id : 190, debit : 0, credit : 23 },
  ];

  const opneningBalance = {
    id : fiscalYearDetails.id,
    fiscal : fiscalYearDetails,
    accounts,
  };

  /**
   * this test is supposed to returns the fiscal year 2017
   * from the date 2017-08-24
   */
  it(`GET /fiscal/date?date=${date} returns the fiscal year from a given date`, () => {
    return agent.get(url.concat(`/date?date=${date}`))
      .then(res => {
        helpers.api.listed(res, 1);
        const [fy] = res.body;
        expect(fy).to.be.an('object');
        expect(fy).to.have.property('fiscal_year_id', 3);
        expect(fy).to.have.property('previous_fiscal_year_id', 2);
        expect(fy).to.have.property('label', 'Test Fiscal Year 2017');

        /**
         * dates are returned with timezone information
         * we extract just the date information
         * FIXME: timezone issue : we have 2017-12-31 in the database
         * but we get 2018-01-01, it is now difficult to test date.
         */
        expect(fy).to.have.property('start_date');
        expect(fy).to.have.property('end_date');
        const fyStartDate = flatDate(fy.start_date);
        const fyEndDate = flatDate(fy.end_date);
        expect(fyStartDate).to.be.equal('2017-01-01');
        expect(fyEndDate).to.be.equal('2017-12-31');

        /**
         * the percentage is value of consumed period in the fiscal year
         * until to the given date
         * proportion = (currentDate - startDate) / (nbMonthOfYear * 30.5)
         * proportion = ('2017-08-24' - '2017-01-01') / (12 * 30.5)
         * proportion = 235 / 366 = 0.6421 = 64.21%
         */
        expect(fy).to.have.property('percentage', 0.6421);
      })
      .catch(helpers.handler);
  });

  it('POST /fiscal/:id/opening_balance set the opening balance of a fiscal year', () => {
    return agent.post(url.concat(`/${fiscalYearDetails.id}/opening_balance`))
      .send(opneningBalance)
      .then(v => {
        console.log(v);
      })
      .catch(helpers.handler);
  });

  it('GET /fiscal/:id/balance get the list of accounts and their balance', () => {

  });

  function flatDate(_date_) {
    const givenDate = new Date(_date_);
    const y = date.getFullYear();
    const m = numberWithZero(givenDate.getMonth() + 1);
    const d = numberWithZero(givenDate.getDate());
    const output = String(y).concat('-', m, '-', d);
    return output;
  }

  function numberWithZero(number) {
    return number < 10 ? '0'.concat(number) : number;
  }

});
