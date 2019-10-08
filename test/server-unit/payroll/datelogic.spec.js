const chai = require('chai');
chai.use(require('chai-datetime'));

const { expect } = chai;
const logic = require('../../../server/controllers/payroll/multiplePayroll/datelogic');

describe('payroll/multiplePayroll/datelogic.js', () => {

  it('#isDateOnWeekend() returns true if date in array passed in', () => {
    const date = new Date(2019, 1, 2); // this is a Sunday (index 6)
    expect(logic.isDateOnWeekend(date, [6])).to.equal(true);
    expect(logic.isDateOnWeekend(date, [1, 6, 0])).to.equal(true);
    expect(logic.isDateOnWeekend(date, [])).to.equal(false);
    expect(logic.isDateOnWeekend(date, [1, 5, 3])).to.equal(false);
  });

  it('#createDateRange() returns an range of dates', () => {
    const numDays = 6;
    const start = new Date(2019, 1, 1);
    const end = new Date(2019, 1, 1 + numDays);

    const range = logic.createDateRange(start, end);
    expect(range).to.be.a('array');
    expect(range).to.have.length(numDays + 1);
    expect(range[0]).to.be.a('date');
  });

  it('#createDateRange() the first array element is the start date', () => {
    const numDays = 2;
    const start = new Date(2019, 1, 1);
    const end = new Date(2019, 1, 1 + numDays);
    const range = logic.createDateRange(start, end);
    expect(range[0]).to.equalDate(start);
  });

  it('#createDateRange() the last array element is the end date', () => {
    const numDays = 2;
    const start = new Date(2019, 1, 1);
    const end = new Date(2019, 1, 1 + numDays);
    const range = logic.createDateRange(start, end);
    expect(range[range.length - 1]).to.equalDate(end);
  });
});
