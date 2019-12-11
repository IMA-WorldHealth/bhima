const { expect } = require('chai');
const chai = require('chai');

// const sinon = require('sinon');
const rewire = require('@ima-worldhealth/rewire');

describe('cronEmailReport', () => {
  let addDynamicDatesOptions;
  let CURRENT_JOBS;
  let addJob;
  let removeJob;

  const DAILY = 1;
  const WEEKLY = 2;
  const MONTHLY = 3;
  const YEARLY = 4;

  // this crontab fires once a minute
  const CRONTAB = '* * * * *';

  before(() => {
    const cronEmailReport = rewire('../../server/controllers/admin/cronEmailReport');
    addDynamicDatesOptions = cronEmailReport.__get__('addDynamicDatesOptions');
    addJob = cronEmailReport.__get__('addJob');
    removeJob = cronEmailReport.__get__('removeJob');
    CURRENT_JOBS = cronEmailReport.__get__('CURRENT_JOBS');
  });


  it('#addDynamicDatesOptions() skips if hasDynamicDates is false', () => {
    const options = { id : 1, label : 'Some ole options' };
    const processed = addDynamicDatesOptions(1, false, options);
    expect(processed).to.deep.equal(options);
  });

  it('#addDynamicDatesOptions() does nothing if cronId is unrecognized', () => {
    const options = { id : 1, label : 'Some ole options' };
    const processed = addDynamicDatesOptions(123, true, options);
    expect(processed).to.deep.equal(options);
  });

  it('#addDynamicDatesOptions() sets the DAILY schedule to the current day', () => {
    const options = { id : 1, label : 'A schedule' };
    const processed = addDynamicDatesOptions(DAILY, true, options);
    expect(processed.dateFrom).to.be.a('object');
    expect(processed.dateTo).to.be.a('object');

    const today = new Date().toDateString();

    expect(processed.dateFrom.toDate().toDateString()).to.equal(today);
    expect(processed.dateTo.toDate().toDateString()).to.equal(today);
  });

  it('#addDynamicDatesOptions() sets the WEEKLY schedule to the current week', () => {
    const options = { id : 1, label : 'A schedule' };

    const { dateFrom, dateTo } = addDynamicDatesOptions(WEEKLY, true, options);
    expect(dateFrom).to.be.a('object');
    expect(dateTo).to.be.a('object');

    const today = new Date();

    expect(dateFrom.toDate().getDay()).to.equal(0);
    expect(dateTo.toDate().getDay()).to.equal(6);

    expect(dateFrom.toDate().getMonth()).to.equal(today.getMonth());
    expect(dateTo.toDate().getMonth()).to.equal(today.getMonth());
  });


  it('#addDynamicDatesOptions() sets the MONTHLY schedule to the current month', () => {
    const options = { id : 1, label : 'A schedule' };

    const { dateFrom, dateTo } = addDynamicDatesOptions(MONTHLY, true, options);
    expect(dateFrom).to.be.a('object');
    expect(dateTo).to.be.a('object');

    const today = new Date();
    expect(dateFrom.toDate().getMonth()).to.equal(today.getMonth());
    expect(dateTo.toDate().getMonth()).to.equal(today.getMonth());

    expect(dateFrom.toDate().getDate()).to.equal(1);
    expect(dateTo.toDate().getDate()).to.be.at.least(28);
  });

  it('#addDynamicDatesOptions() sets the YEARLY schedule to the current year', () => {
    const options = { id : 1, label : 'A schedule' };

    const { dateFrom, dateTo } = addDynamicDatesOptions(YEARLY, true, options);
    expect(dateFrom).to.be.a('object');
    expect(dateTo).to.be.a('object');

    const today = new Date();
    expect(dateFrom.toDate().getFullYear()).to.equal(today.getFullYear());
    expect(dateTo.toDate().getFullYear()).to.equal(today.getFullYear());

    expect(dateFrom.toDate().getMonth()).to.equal(0);
    expect(dateTo.toDate().getMonth()).to.equal(11);

    expect(dateFrom.toDate().getDate()).to.equal(1);
    expect(dateTo.toDate().getDate()).to.equal(31);
  });

  it('#addJob() starts a cron job', () => {
    const cb = chai.spy(() => {});
    const job = addJob(CRONTAB, cb, {});

    expect(job).to.be.an('object');
    expect(job).to.have.any.keys('running');
    expect(job.running).to.equal(true);
  });

  it('#removeJob() removes a cron job by its identifier', () => {
    // mock a cron job
    const stop = chai.spy(() => {});
    const id = 3;
    const job = { id, job : { stop } };
    CURRENT_JOBS.set(id, job);

    expect(CURRENT_JOBS.size).to.equal(1);

    removeJob(id);

    expect(stop).to.have.been.called();
    expect(CURRENT_JOBS.size).to.equal(0);
  });
});
