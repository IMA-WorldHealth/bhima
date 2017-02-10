/* global browser, element, by */

const chai = require('chai');
const expect = chai.expect;

const components = require('../../shared/components');
const FU = require('../../shared/FormUtils');
const helpers = require('../../shared/helpers');
const moment = require('moment');
helpers.configure(chai);

describe('Balance Report Generation', () => {
  'use strict';

  before(() => helpers.navigate('#/reports/balance'));

  const annualReport = {
    title: 'Balance Annuelle 2016',
    dateFrom: '01/01/2016',
    dateTo: '31/12/2016',
    dateOption: 0,
    classe: '*'
  };

  const reportDate = new Date();
  const humanDate = moment(reportDate).format('DD MMMM YYYY');

  const report = {
    title: 'Balance jusqu\'a la date ' + humanDate,
    date: reportDate,
    dateOption: 1,
    classe: '*'
  };

  it('GET /reports/finance/balance return an annual balance report to the client', () => {

    // click on the create button
    FU.buttons.create();

    // set report title
    FU.input('ReportConfigCtrl.label', annualReport.title);

    // set the report classe
    FU.uiSelect('ReportConfigCtrl.classe', annualReport.classe);

    // select the range date option
    FU.radio('ReportConfigCtrl.dateOption', annualReport.dateOption);

    // date interval
    components.dateInterval.range(annualReport.dateFrom, annualReport.dateTo);

    // generate
    FU.buttons.submit();

    components.notification.hasSuccess();
  });

  it(`GET /reports/finance/balance return the balance at ${humanDate}`, () => {

    // click on the create button
    FU.buttons.create();

    // set report title
    FU.input('ReportConfigCtrl.label', report.title);

    // set the report classe
    FU.uiSelect('ReportConfigCtrl.classe', report.classe);

    // select the range date option
    FU.radio('ReportConfigCtrl.dateOption', report.dateOption);

    // the until date
    components.dateEditor.set(report.date, null, '[name="label"]');

    // generate
    FU.buttons.submit();

    components.notification.hasSuccess();
  });
});
