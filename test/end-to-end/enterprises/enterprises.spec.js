/* global element, by, inject, browser */
const chai = require('chai');
const expect = chai.expect;

const helpers = require('../shared/helpers');
helpers.configure(chai);

const FU = require('../shared/FormUtils');
const components = require('../shared/components');

describe('Enterprises', function () {

  const path = '#!/enterprises';
  const enterpriseId = 1;

  // enterprise
  const enterprise = {
    name : 'Interchurch Medical Assistance',
    abbr : 'IMA',
    email : 'ima@imaworldhealth.com',
    po_box : 'POBOX USA 1',
    phone : '01500',
    gain_account_id : 'Test Gain Account',
    loss_account_id : 'Test Loss Account'
  };

  // default enterprise
  const default_enterprise = {
    name : 'Test Enterprise',
    abbr : 'TE',
    email : 'enterprise@test.org',
    po_box : 'POBOX USA 1',
    phone : '243 81 504 0540',
    gain_account_id : 'Test Gain Account',
    loss_account_id : 'Test Loss Account'
  };

  // project
  const abbr = suffix();
  const project = {
    name : 'Test Project ' + abbr,
    abbr : abbr
  };

  // project update
  const abbr_update = suffix();
  const project_update = {
    name : 'Test Project Update ' + abbr_update,
    abbr : abbr_update
  };

  // navigate to the enterprise module before running tests
  before(() => helpers.navigate(path));

  /**
   * The actual enterprise module doesn't need to create new one
   * so we need only to update enterprise informations
   */
  it('set enterprise data', function () {

    FU.input('EnterpriseCtrl.enterprise.name', enterprise.name);
    FU.input('EnterpriseCtrl.enterprise.abbr', enterprise.abbr);

    components.accountSelect.set(enterprise.gain_account_id, 'gain-account-id');
    components.accountSelect.set(enterprise.loss_account_id, 'loss-account-id');

    FU.input('EnterpriseCtrl.enterprise.po_box', enterprise.po_box);
    FU.input('EnterpriseCtrl.enterprise.email', enterprise.email);
    FU.input('EnterpriseCtrl.enterprise.phone', enterprise.phone);

    // select the locations specified
    components.locationSelect.set(helpers.data.locations);

    // submit the page to the server
    FU.buttons.submit();

    components.notification.hasSuccess();
  });

  it('blocks invalid form submission with relevant error classes', function () {

    FU.input('EnterpriseCtrl.enterprise.name', '');
    FU.input('EnterpriseCtrl.enterprise.abbr', '');

    FU.buttons.submit();

    // verify form has not been submitted
    expect(helpers.getCurrentPath()).to.eventually.equal(path);

    // The following fields should be required
    FU.validation.error('EnterpriseCtrl.enterprise.name');
    FU.validation.error('EnterpriseCtrl.enterprise.abbr');

    // The following fields is not required
    FU.validation.ok('EnterpriseCtrl.enterprise.email');
    FU.validation.ok('EnterpriseCtrl.enterprise.po_box');
    FU.validation.ok('EnterpriseCtrl.enterprise.phone');
  });

  /**
   * Set default enterprise data for others tests
   */
   it('reset enterprise data to default', function () {

     FU.input('EnterpriseCtrl.enterprise.name', default_enterprise.name);
     FU.input('EnterpriseCtrl.enterprise.abbr', default_enterprise.abbr);

     components.accountSelect.set(default_enterprise.gain_account_id, 'gain-account-id');
     components.accountSelect.set(default_enterprise.loss_account_id, 'loss-account-id');

     FU.input('EnterpriseCtrl.enterprise.po_box', default_enterprise.po_box);
     FU.input('EnterpriseCtrl.enterprise.email', default_enterprise.email);
     FU.input('EnterpriseCtrl.enterprise.phone', default_enterprise.phone);

     // select the locations specified
     components.locationSelect.set(helpers.data.locations);

     // submit the page to the server
     FU.buttons.submit();

     components.notification.hasSuccess();
   });

  it('add a new project for the enterprise', function () {
    FU.buttons.create();

    FU.input('$ctrl.project.name', project.name);
    FU.input('$ctrl.project.abbr', project.abbr);

    FU.modal.submit();

    components.notification.hasSuccess();
  });

  it('edit an existing project', function () {
    element(by.css(`[data-update="${abbr}"]`)).click();

    FU.input('$ctrl.project.name', project_update.name);
    FU.input('$ctrl.project.abbr', project_update.abbr);

    FU.modal.submit();

    components.notification.hasSuccess();
  });

  it('delete an existing project', function () {
    element(by.css(`[data-delete="${abbr_update}"]`)).click();

    FU.input('$ctrl.text', project_update.name);

    FU.modal.submit();

    components.notification.hasSuccess();
  });

  /**
   * @function suffix
   * @desc This function returns a random 3 characters string as an abbreviation
   */
  function suffix() {
    'use strict';
    let a = String.fromCharCode(random(65, 90));
    let b = String.fromCharCode(random(65, 90));
    let c = String.fromCharCode(random(65, 90));

    return a.concat(b, c);
  }

  function random(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
  }
});
