/* global element, by, inject, browser */
const chai = require('chai');
const expect = chai.expect;

const helpers = require('../shared/helpers');
helpers.configure(chai);

const FU = require('../shared/FormUtils');
const components = require('../shared/components');

describe('Enterprises Module', function () {

  const path = '#/enterprises';
  const enterpriseId = 1;
  const enterprise = {
    name : 'Interchurch Medical Assistance',
    abbr : 'IMA',
    email : 'ima@imaworldhealth.com',
    po_box : 'POBOX USA 1',
    phone : '01500',
    currency_id : 1
  };

  // navigate to the enterprise module before running tests
  before(() => helpers.navigate(path));


  it('creates a new enterprise', function () {
    FU.buttons.create();

    FU.input('EnterpriseCtrl.enterprise.name', enterprise.name);
    FU.input('EnterpriseCtrl.enterprise.abbr', enterprise.abbr);
    FU.input('EnterpriseCtrl.enterprise.email', enterprise.email);
    FU.input('EnterpriseCtrl.enterprise.po_box', enterprise.po_box);
    FU.input('EnterpriseCtrl.enterprise.phone', enterprise.phone);

    // select the locations specified
    components.locationSelect.set(helpers.data.locations);

    FU.radio('EnterpriseCtrl.enterprise.currency_id', enterprise.currency_id);

    // submit the page to the server
    FU.buttons.submit();

    FU.exists(by.id('create_success'), true);
  });


  it('edits an enterprise', function () {
    element(by.id('enterprise-' + enterpriseId)).click();

    FU.input('EnterpriseCtrl.enterprise.name', 'Test Enterprise Updated');
    FU.input('EnterpriseCtrl.enterprise.abbr', 'TEU');

    element(by.id('change_enterprise')).click();
    FU.exists(by.id('update_success'), true);
  });


  it('blocks invalid form submission with relevant error classes', function () {
    FU.buttons.create();
    FU.buttons.submit();

    // verify form has not been submitted
    expect(helpers.getCurrentPath()).to.eventually.equal(path);

    // The following fields should be required
    FU.validation.error('EnterpriseCtrl.enterprise.name');
    FU.validation.error('EnterpriseCtrl.enterprise.abbr');
    FU.validation.error('EnterpriseCtrl.enterprise.currency_id');

    // The following fields is not required
    FU.validation.ok('EnterpriseCtrl.enterprise.email');
    FU.validation.ok('EnterpriseCtrl.enterprise.po_box');
    FU.validation.ok('EnterpriseCtrl.enterprise.phone');
  });
});
