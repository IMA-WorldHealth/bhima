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

    FU.input('GroupEditCtrl.group.name', 'E2E Debtor Group');
    FU.uiSelect('GroupEditCtrl.group.account_id', '47001');
    FU.input('GroupEditCtrl.group.max_credit', '1200');
    FU.input('GroupEditCtrl.group.note', 'This debtor group was created by an automated end to end test.');
    FU.input('GroupEditCtrl.group.phone', '+243 834 443');
    FU.input('GroupEditCtrl.group.email', 'e2e@email.com');

    FU.select('GroupEditCtrl.group.price_list_uuid', 'Test Price List');

    FU.buttons.submit();

    components.notification.hasSuccess();

    expect(element.all(by.css('[data-group-entry]')).count()).to.eventually.equal(initialGroups + 1);
  });

  it('updates a debtor group', function () {

    let updateGroup = element.all(by.css('[data-group-entry]'));
    updateGroup.all(by.css('[data-method="update"]')).first().click();

    FU.input('GroupEditCtrl.group.max_credit', '500');
    FU.input('GroupEditCtrl.group.name', '[Updated]');

    FU.buttons.submit();

    components.notification.hasSuccess();
  });
});
