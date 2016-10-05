/* global browser, element, by */
'use strict';

const chai = require('chai');
const expect = chai.expect;

const helpers = require('../shared/helpers');
const FU = require('../shared/FormUtils');

const components = require('../shared/components');

helpers.configure(chai);

describe('Patient Edit', function () {
  const root = '#/patients/';
  const patient = '274c51ae-efcc-4238-98c6-f402bfb39866';

  const path = root.concat(patient, '/edit');

  before(() => browser.get(path));

  it('ignores and warns for submission with no changes', function () {
    FU.buttons.submit();
    components.notification.hasWarn();
  });

  it('updates a patients details', function () {

    // required information
    FU.input('PatientEditCtrl.medical.display_name', 'Updated Last Name');

    // optional information
    FU.input('PatientEditCtrl.medical.title', 'Mr.');
    FU.input('PatientEditCtrl.medical.email', 'update@email.com');
    FU.buttons.submit();
    components.notification.hasSuccess();
  });

  it('updates a patients debtor group subscription', function () {

    // opens update modal
    element(by.css('[data-update-group-debtor]')).click();

    let select = element(by.model('UpdateDebtorGroupCtrl.debtor_group_uuid'));
    let option = select.element(by.cssContainingText('option', 'Second Test Debtor Group'));
    option.click();

    element(by.css('[data-confirm-group]')).click();

    components.notification.hasSuccess();
  });

  it('updates a patients group subscriptions', function () {
    element(by.css('[data-update-group-patient]')).click();

    element.all(by.css('[data-group-option]')).get(1).click();
    element(by.css('[data-confirm-group]')).click();

    components.notification.hasSuccess();
  });
});
