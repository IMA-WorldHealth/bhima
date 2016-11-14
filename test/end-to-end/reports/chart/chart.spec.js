/* global browser, element, by */

const chai = require('chai');
const expect = chai.expect;

const helpers = require('../../shared/helpers');
helpers.configure(chai);

const FU = require('../../shared/FormUtils');
const GU = require('../../shared/GridUtils');

const components = require('../../shared/components');
const ReportPage = require('../page.js');

describe('Chart of Accounts Report Generation', () => {
  'use strict';

  let Page;
  const key = 'accounts_chart';

  before(() => {
    helpers.navigate(`#/reports/${key}`);
    Page = new ReportPage(key);
  });

  it('should be empty on start ', function () {
    Page.expectPageToBeEmpty();
  });

  it('generates a new Chart of Accounts PDF report', function () {
    Page.create({
      'ReportConfigCtrl.label' : 'Generated Chart of Accounts'
    });

    components.notification.hasSuccess();
  });

  it('deletes the old Chart of Accounts PDF report', function () {
    Page.delete(0);

    components.notification.hasSuccess();
  });

});
