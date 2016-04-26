/* global element, by, browser */
const chai    = require('chai');
const expect  = chai.expect;

const helpers = require('../shared/helpers');
helpers.configure(chai);

const FormUtils = require('../shared/FormUtils');
const components = require('../shared/components');

describe('Debtor Groups', function () {
  'use strict';

  before(() => browser.get('#/debtor_groups'));

  const groupUuid = '4de0fe47-177f-4d30-b95f-cff8166400b4';

  const debtorGroup = {
    name : '(E2E) Debtor Group',
    account_id : 3638,
    phone : '0811838662',
    email : 'debtorgroup@info.com',
    note : '(E2E) Nouveau debtor group de test',
    max_credit : 2500
  };

  const update = {
    name : '(E2E) Debtor Group (updated)',
    account_id : 3638,
    phone : '0818061031',
    email : 'debtorgroup@info.com (updated)',
    note : '(E2E) Nouveau debtor group de test (updated)',
    max_credit : 5500
  };

  it('creates a new debtor group', function () {
    FormUtils.buttons.create();

    /** debtor group info */
    FormUtils.input('DebtorGroupCtrl.debtorGroup.name', debtorGroup.name);

    FormUtils.input('DebtorGroupCtrl.debtorGroup.account_id', debtorGroup.account_id);
    var option = element.all(by.repeater('match in matches track by $index')).first();
    option.click();

    element.all(by.options('price.uuid as price.label for price in DebtorGroupCtrl.prices.data')).enabled().first().click();
    FormUtils.input('DebtorGroupCtrl.debtorGroup.max_credit', debtorGroup.max_credit);

    /** debtor group characteristics */
    element(by.model('DebtorGroupCtrl.debtorGroup.is_convention')).click();
    element(by.model('DebtorGroupCtrl.debtorGroup.locked')).click();
    element(by.model('DebtorGroupCtrl.debtorGroup.apply_subsidies')).click();
    element(by.model('DebtorGroupCtrl.debtorGroup.apply_discounts')).click();
    element(by.model('DebtorGroupCtrl.debtorGroup.apply_billing_services')).click();

    /** contact */
    FormUtils.input('DebtorGroupCtrl.debtorGroup.phone', debtorGroup.phone);
    FormUtils.input('DebtorGroupCtrl.debtorGroup.email', debtorGroup.email);
    FormUtils.input('DebtorGroupCtrl.debtorGroup.note', debtorGroup.note);

    components.locationSelect.set(helpers.data.locations);

    FormUtils.buttons.submit();

    FormUtils.exists(by.id('create_success'), true);
  });

  it('updates an existing debtor group', function () {
    element(by.name('group-' + groupUuid)).click();

    /** debtor group info */
    FormUtils.input('DebtorGroupCtrl.debtorGroup.name', update.name);
    FormUtils.input('DebtorGroupCtrl.debtorGroup.account_id', update.account_id);
    var option = element.all(by.repeater('match in matches track by $index')).first();
    option.click();

    element.all(by.options('price.uuid as price.label for price in DebtorGroupCtrl.prices.data')).enabled().first().click();

    FormUtils.input('DebtorGroupCtrl.debtorGroup.max_credit', update.max_credit);

    /** debtor group characteristics */
    element(by.model('DebtorGroupCtrl.debtorGroup.is_convention')).click();
    element(by.model('DebtorGroupCtrl.debtorGroup.locked')).click();
    element(by.model('DebtorGroupCtrl.debtorGroup.apply_subsidies')).click();
    element(by.model('DebtorGroupCtrl.debtorGroup.apply_discounts')).click();
    element(by.model('DebtorGroupCtrl.debtorGroup.apply_billing_services')).click();

    /** contact */
    FormUtils.input('DebtorGroupCtrl.debtorGroup.phone', update.phone);
    FormUtils.input('DebtorGroupCtrl.debtorGroup.email', update.email);
    FormUtils.input('DebtorGroupCtrl.debtorGroup.note', update.note);

    /** location Plateau in Kasai  */
    var locations = [
     'dbe330b6-5cde-4830-8c30-dc00eccd1a5f', // Democratic Republic of the Congo
     '5cf83463-2718-4a65-abdd-f9ad2fe4e195', // Kasai Occidental,
     'ecd22221-88ad-49e2-84b2-c8161ad39f53', // Kananga,
     'f9d555de-434d-47ac-86bb-b0fcfd3bc75f' // Plateau
    ];

    components.locationSelect.set(locations);

    FormUtils.buttons.submit();

    FormUtils.exists(by.id('update_success'), true);
  });

  it('form blocks when missing data', function () {
    FormUtils.buttons.create();
    FormUtils.buttons.submit();
    FormUtils.exists(by.id('error-feedback'), true);
  });
});
