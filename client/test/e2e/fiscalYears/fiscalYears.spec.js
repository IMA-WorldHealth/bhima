/* global element, by, browser */
const chai = require('chai');
const expect = chai.expect;

const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
const components = require('../shared/components');

helpers.configure(chai);

describe('Fiscal year Module', function () {
  'use strict';

  const path = '#/fiscal';
  var pathNew = '#/fiscal/fiscal/new';

  before(() => helpers.navigate(path));

  const fiscalYear = {
    label : 'A Special Fiscal Year',
    start_date : new Date('2017-01-01'),
    number_of_months : 12,
    note : 'Note for the new fiscal Year'
  };
  var fiscalId = 3;

  it('blocks invalid form submission with relevant error classes', function () {
    // switch to the create form
    FU.buttons.create();

    // verify form has not been successfully submitted
    expect(helpers.getCurrentPath()).to.eventually.equal(pathNew);

    FU.buttons.submit();

    // the following fields should be required
    FU.validation.error('FiscalManageCtrl.fiscal.label');
    FU.validation.error('FiscalManageCtrl.fiscal.number_of_months');

    components.notification.hasDanger();    
  });

  it('creates a new fiscalYear', function () {
    FU.input('FiscalManageCtrl.fiscal.label', fiscalYear.label);

    // select the proper date
    components.dateEditor.set(fiscalYear.start_date, 'start_date');
    FU.input('FiscalManageCtrl.fiscal.number_of_months', fiscalYear.number_of_months);
    FU.input('FiscalManageCtrl.fiscal.note', fiscalYear.note);
    FU.buttons.submit();
    
    components.notification.hasSuccess();
  });


  it('edits a fiscal Year', function () {
    element(by.id('update_' + fiscalId)).click();

    // modify the fiscal year label and note
    FU.input('FiscalManageCtrl.fiscal.label', ' 2017 update');
    FU.input('FiscalManageCtrl.fiscal.note', ' Complement note');
    
    FU.buttons.submit();
    components.notification.hasSuccess();
  });

  it('delete a fiscal Year', function () {
    element(by.id('remove_' + fiscalId)).click();

    // click the alert asking for permission
    components.modalAction.confirm();
    components.notification.hasSuccess();
  });

});
