const { expect } = require('chai');
const dates = require('../../server/lib/template/helpers/dates');

const DateHelperUnitTests = function () {
  it('#date() should format a date is "DD/MM/YYYY" format.', () => {
    const date = new Date('2015-03-25 12:00:00');
    const expected = '25/03/2015';
    const formated = dates.date(date);
    expect(formated).to.equal(expected);
  });

  it('#date() should return an empty string ("") if the date is null.', () => {
    const dat = null;
    const expected = '';
    const formated = dates.date(dat);
    expect(formated).to.equal(expected);
  });

  it('#date() should allow you to specify a custom format.', () => {
    const dat = new Date('2015-03-25');
    const expected = '03/2015';
    const format = 'MM/YYYY';
    const formated = dates.date(dat, format);
    expect(formated).to.equal(expected);
  });

  it('#timestamp() should return an empty string ("") if the date is null.', () => {
    const dat = null;
    const expected = '';
    const formated = dates.timestamp(dat);
    expect(formated).to.deep.equal(expected);
  });

  it('#timestamp() should format a date as DD/MM/YYYY HH:mm:ss.', () => {
    const dat = new Date('2015-03-25 10:05:15');
    const expected = '25/03/2015 10:05:15';
    const formated = dates.timestamp(dat);
    expect(formated).to.equal(expected);
  });

  it('#age() should return 0 for the current date.', () => {
    const dat = new Date();
    const expected = 0;
    const formated = dates.age(dat);
    expect(formated).to.equal(expected);
  });


  it('#age() should return 3 for the current date.', () => {
    const current = new Date();
    const dob = new Date((current.getFullYear() - 3), current.getMonth());
    const formated = dates.age(dob);
    const expected = 3;
    expect(formated).to.equal(expected);
  });

  it('#month should return the full month name in English for a given month.', () => {
    const dat = new Date('2015-03-25 10:05:15');
    const formated = dates.month(dat);
    const expected = 'March';
    expect(formated).to.equal(expected);
  });
};

describe('lib/template/helpers/dates.js', DateHelperUnitTests);
