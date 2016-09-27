/* global element, by, browser */
const chai = require('chai');
const expect = chai.expect;

const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
const components = require('../shared/components');

helpers.configure(chai);

describe('Fiscal Year', function () {
  'use strict';

  const path = '#/fiscal';
  var pathNew = '#/fiscal/create';

  before(() => helpers.navigate(path));

  const fiscalYear = {
    label : 'A Special Fiscal Year',
    note : 'Note for the new fiscal Year',
    previous : 'Test Fiscal Year 2016'
  };

  it('blocks invalid form submission with relevant error classes', function () {
    // switch to the create form
    FU.buttons.create();

    // verify form has not been successfully submitted
    expect(helpers.getCurrentPath()).to.eventually.equal(pathNew);

    // set invalid date range to test `number_of_months`
    components.dateInterval.range('01/02/2016', '01/01/2016');

    FU.buttons.submit();

    // the following fields should be required
    FU.validation.error('FiscalManageCtrl.fiscal.label');
    FU.validation.error('FiscalManageCtrl.fiscal.number_of_months');

    components.notification.hasDanger();
  });

  it('creates a new fiscalYear', function () {
    FU.input('FiscalManageCtrl.fiscal.label', fiscalYear.label);

    // select the proper date
    components.dateInterval.range('01/01/2018', '31/12/2018');
    FU.select('FiscalManageCtrl.fiscal.previous_fiscal_year_id', fiscalYear.previous);
    FU.input('FiscalManageCtrl.fiscal.note', fiscalYear.note);
    FU.buttons.submit();

    components.notification.hasSuccess();
  });


  it('edits a fiscal Year', function () {
    var updateButton = element.all(by.css('[data-fiscal-entry]'));
    updateButton.all(by.css('[data-method="update"]')).first().click();

    // modify the fiscal year label and note
    FU.input('FiscalManageCtrl.fiscal.label', 'Test Fiscal Year 2017 (update)');
    components.dateInterval.range('01/01/2017', '31/12/2017');
    FU.input('FiscalManageCtrl.fiscal.note', 'Test 2017 (update)');

    FU.buttons.submit();
    components.notification.hasSuccess();
  });

  it('delete a fiscal Year', function () {
    var deleteButton = element.all(by.css('[data-fiscal-entry]'));
    deleteButton.all(by.css('[data-method="delete"]')).first().click();

    // click the alert asking for permission
    components.modalAction.confirm();
    components.notification.hasSuccess();
  });
});
