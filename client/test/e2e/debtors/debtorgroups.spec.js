/* global browser, element, by, protractor */
var chai = require('chai');
var expect = chai.expect;

var helpers = require('../shared/helpers');
helpers.configure(chai);

var components = require('../shared/components');
var FU = require('../shared/FormUtils');

describe('Debtor Groups Management', function () {
  'use strict';

  let initialGroups = 3;

  /** @const */
  var root = '#/debtors/groups';
  before(function () { browser.get(root); });

  it('lists base test debtor groups', function () {
    expect(element.all(by.css('[data-group-entry]')).count()).to.eventually.equal(initialGroups);
  });

  it('creates a debtor group', function () {
    FU.buttons.create();

    // Account selection
    /** @todo Suggested helper AccountSelect.selectFirst('setInput') */
    var groupAccount = element(by.css('[data-component-find-account]'));
    var input = groupAccount.element(by.model('GroupEditCtrl.group.account_id'));
    input.sendKeys('47001');
    var option = groupAccount.all(by.repeater('match in matches track by $index')).first();
    option.click();

    FU.input('GroupEditCtrl.group.name', 'E2E Debtor Group');
    FU.input('GroupEditCtrl.group.max_credit', '1200');
    FU.input('GroupEditCtrl.group.note', 'This debtor group was created by an automated end to end test.');
    FU.input('GroupEditCtrl.group.phone', '+243 834 443');
    FU.input('GroupEditCtrl.group.email', 'e2e@email.com');

    var select = FU.select('GroupEditCtrl.group.price_list_uuid').enabled().first().click();

    FU.buttons.submit();

    components.notification.verify();
    components.notification.dismiss();

    expect(element.all(by.css('[data-group-entry]')).count()).to.eventually.equal(initialGroups + 1);
  });

  it('updates a debtor group', function () {

    var updateGroup = element.all(by.css('[data-group-entry]'));
    updateGroup.all(by.css('[data-method="update"]')).first().click();

    FU.input('GroupEditCtrl.group.max_credit', '500');
    FU.input('GroupEditCtrl.group.name', '[Updated]');

    FU.buttons.submit();

    components.notification.verify();
    components.notification.dismiss();
  });
});
