/* global browser, element, by */
const chai = require('chai');
const expect = chai.expect;
const helpers = require('../shared/helpers');
helpers.configure(chai);

const components = require('../shared/components');
const FU = require('../shared/FormUtils');

describe('Creditor Groups Management', () => {
  'use strict';

  const path = '#/admin/creditor_groups';
  before(() => helpers.navigate(path));

  const INITIAL_GROUP = 2;

  let currentDate = new Date();
  let uniqueIdentifier = currentDate.getTime().toString();

  const newCreditorGroup = {
    name : 'E2E Creditor Group ' + uniqueIdentifier,
    account : '41001'
  };

  it('Get initial list of creditor groups', () => {
    expect(element.all(by.css('[data-group-entry]')).count()).to.eventually.equal(INITIAL_GROUP);
  });

  it('creates a creditor group', () => {
    FU.buttons.create();

    FU.input('CreditorGroupCtrl.bundle.name', newCreditorGroup.name);
    FU.uiSelect('CreditorGroupCtrl.bundle.account_id', newCreditorGroup.account);

    FU.buttons.submit();
    components.notification.hasSuccess();
    expect(element.all(by.css('[data-group-entry]')).count()).to.eventually.equal(INITIAL_GROUP + 1);
  });

  it('updates a creditor group', () => {
    let updateGroup = element.all(by.css('[data-group-entry]'));
    updateGroup.all(by.css('[data-method="update"]')).first().click();

    FU.input('CreditorGroupCtrl.bundle.name', newCreditorGroup.name + ' (updated)');
    element(by.model('CreditorGroupCtrl.bundle.locked')).click();

    FU.buttons.submit();
    components.notification.hasSuccess();
  });

  it('Cannot delete a used creditor group', () => {
    // click on the bottom element ie old
    let group = element.all(by.css('[data-group-entry]'));
    group.all(by.css('[data-method="delete"]')).last().click();

    FU.buttons.submit();
    components.notification.hasError();
  });

  it('Delete a creditor group', () => {

    // click on tne new one
    let group = element.all(by.css('[data-group-entry]'));
    group.all(by.css('[data-method="delete"]')).first().click();

    FU.buttons.submit();
    components.notification.hasSuccess();
  });

});
