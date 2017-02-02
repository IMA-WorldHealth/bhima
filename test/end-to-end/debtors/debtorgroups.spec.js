/* global browser, element, by */
const chai = require('chai');
const expect = chai.expect;
const helpers = require('../shared/helpers');
helpers.configure(chai);

const components = require('../shared/components');
const FU = require('../shared/FormUtils');

describe('Debtor Groups Management', function () {
  'use strict';

  let initialGroups = 2;

  const root = '#/debtors/groups';
  before(() => helpers.navigate(root));

  it('lists base test debtor groups', function () {
    expect(element.all(by.css('[data-group-entry]')).count()).to.eventually.equal(initialGroups);
  });

  it('creates a debtor group', function () {
    FU.buttons.create();

    FU.input('GroupUpdateCtrl.group.name', 'AE2E Debtor Group');
    FU.uiSelect('GroupUpdateCtrl.group.account_id', '47001');
    FU.input('GroupUpdateCtrl.group.max_credit', '1200');
    FU.input('GroupUpdateCtrl.group.note', 'This debtor group was created by an automated end to end test.');
    FU.input('GroupUpdateCtrl.group.phone', '+243 834 443');
    FU.input('GroupUpdateCtrl.group.email', 'e2e@email.com');

    FU.select('GroupUpdateCtrl.group.price_list_uuid', 'Test Price List');

    FU.buttons.submit();

    components.notification.hasSuccess();

    expect(element.all(by.css('[data-group-entry]')).count()).to.eventually.equal(initialGroups + 1);
  });

  it('Delete a debtor group', function () {

    let deleteGroup = element.all(by.css('[data-group-entry]'));
    deleteGroup.all(by.css('[data-method="delete"]')).get(2).click();

    FU.buttons.submit();

    components.notification.hasSuccess();
  });


  it('updates a debtor group', function () {

    let updateGroup = element.all(by.css('[data-group-entry]'));
    updateGroup.all(by.css('[data-method="update"]')).first().click();

    FU.input('GroupUpdateCtrl.group.max_credit', '500');
    FU.input('GroupUpdateCtrl.group.name', '[Updated]');

    FU.buttons.submit();

    components.notification.hasSuccess();
  });


  it('updates debtor group billing service subscriptions', function () {
    let updateGroup = element.all(by.css('[data-group-entry]'));
    updateGroup.all(by.css('[data-method="update"]')).first().click();

    element(by.css('#billingServiceSubscription')).click();
    element.all(by.css('[data-group-option]')).get(1).click();
    FU.modal.submit();
    components.notification.hasSuccess();
  });

  it('updates debtor group subsidy subscriptions', function () {
    element(by.css('#subsidySubscription')).click();
    element.all(by.css('[data-group-option]')).get(1).click();
    FU.modal.submit();
    components.notification.hasSuccess();
  });

});
