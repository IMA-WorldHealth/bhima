/* global browser, element, by */

const chai = require('chai');
const helpers = require('../../shared/helpers');

helpers.configure(chai);

const components = require('../../shared/components');
const ReportPage = require('../page.js');

describe('Chart of Accounts Report Generation', () => {
  let Page;
  const key = 'accounts_chart';

  before(() => {
    helpers.navigate(`#!/reports/${key}`);
    Page = new ReportPage(key);
  });

  it('should be empty on start ', () => {
    Page.expectPageToBeEmpty();
  });

  it('generates a new Chart of Accounts PDF report', () => {
    Page.create({
      'ReportConfigCtrl.label' : 'Generated Chart of Accounts',
    });

    components.notification.hasSuccess();
  });

  it('deletes the old Chart of Accounts PDF report', () => {
    Page.delete(0);

    components.notification.hasSuccess();
  });

});
