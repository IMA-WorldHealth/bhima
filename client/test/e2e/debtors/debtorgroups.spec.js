/* global browser, element, by, protractor */
var chai = require('chai');
var expect = chai.expect;

var helpers = require('../shared/helpers');
helpers.configure(chai);

var components = require('../shared/components');
var FU = require('../shared/FormUtils');

describe.only('Debtor Groups Management', function () {
  'use strict';


  /** @const */
  var root = '#/debtors/groups';

  before(function () { browser.get(root); });

  it('lists base test debtor groups', function () {

    expect(element.all(by.css('[data-group-entry]')).count()).to.eventually.equal(2);
  });

  it('creates a debtor group', function () {
    FU.buttons.create();

    // FU.exists(by.css('[name="debtorGroup"]'), true);

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

    // FU.exists(by.css('[data-success-notification]'), true);
    // element(by.css('[data-dismiss="notification"]')).click();
    components.notification.verify();
    components.notification.dismiss();

    expect(element.all(by.css('[data-group-entry]')).count()).to.eventually.equal(3);
  });

  it('updates a debtor group', function () {

    var updateGroup = element.all(by.css('[data-group-entry]'));
    updateGroup.all(by.css('[data-method="update"]')).first().click();

    FU.input('GroupEditCtrl.group.max_credit', '500');
    FU.input('GroupEditCtrl.group.name', '[Updated]');

    FU.buttons.submit();

    // browser.driver.wait(protractor.until.elementIsVisible(element(by.css('[data-success-entry]'))));
    components.notification.verify();
    components.notification.dismiss();
    // FU.exists(by.css('[data-success-notification]'), true);
    // element(by.css('[data-dismiss="notification"]')).click();
  });

  it('displays created and updated groups', function () {

  });
});
