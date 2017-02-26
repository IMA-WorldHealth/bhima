/* global element, by, inject, browser */
'use strict';

const chai   = require('chai');
const expect = chai.expect;

const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
const components = require('../shared/components');

helpers.configure(chai);

describe('Inventory Configuration', () => {

  const url = '#/inventory/configuration';

  // navigate to the page
  before(() => helpers.navigate(url));

  const group = {
    name : '[E2E] Inventory Group',
    code : '1704',
    sales_account : 'Test Capital One',
    stock_account : 'Test Capital Two',
    cogs_account  : 'Test Debtor Accounts1'
  };

  const updateGroup = {
    name : '[E2E] Inventory Group updated',
    code : '2504',
    sales_account : 'Test Capital One',
  };

  // inventory type
  const type = { text : '[E2E] Inventory Type' };
  const updateType = { text : '[E2E] Inventory Type updated' };

  // inventory unit
  const unit = { text : '[E2E] Inventory Unit' };
  const updateUnit = { text : '[E2E] Inventory Unit updated' };

  describe('Groups', () => {
    // navigate to the page
    before(() => helpers.navigate(url));

    it('successfully creates a new inventory group', () => {
      element(by.css('[data-create-group]')).click();
      FU.input('$ctrl.session.name', group.name);
      FU.input('$ctrl.session.code', group.code);
      FU.uiSelect('$ctrl.session.salesAccount', group.sales_account);
      FU.uiSelect('$ctrl.session.stockAccount', group.stock_account);
      FU.uiSelect('$ctrl.session.cogsAccount', group.cogs_account);
      FU.buttons.submit();
      components.notification.hasSuccess();
    });

    it('successfully updates an existing inventory group', () => {
      element(by.css('[data-edit-group="' + group.code +'"]')).click();
      FU.input('$ctrl.session.name', updateGroup.name);
      FU.input('$ctrl.session.code', updateGroup.code);
      FU.uiSelect('$ctrl.session.salesAccount', updateGroup.sales_account);
      element(by.model('$ctrl.session.stockAccount')).$('[ng-click="$select.clear($event)"]').click();
      element(by.model('$ctrl.session.cogsAccount')).$('[ng-click="$select.clear($event)"]').click();
      FU.buttons.submit();
      components.notification.hasSuccess();
    });

    it('successfully deletes an existing inventory group', () => {
      element(by.css('[data-delete-group="' + group.code +'"]')).click();
      FU.buttons.submit();
      components.notification.hasSuccess();
    });

  });

  // test inventory type
  describe('Types', () => {
    // navigate to the page
    before(() => helpers.navigate(url));

    it('Successfully creates a new inventory type', () => {
      element(by.css('[data-create-type]')).click();
      FU.input('$ctrl.session.text', type.text);
      FU.buttons.submit();
      components.notification.hasSuccess();
    });

    it('Successfully updates an existing inventory type', () => {
      element(by.css('[data-edit-type="' + type.text +'"]')).click();
      FU.input('$ctrl.session.text', updateType.text);
      FU.buttons.submit();
      components.notification.hasSuccess();
    });

    it('Successfully deletes an existing inventory type', () => {
      element(by.css('[data-delete-type="' + type.text +'"]')).click();
      FU.buttons.submit();
      components.notification.hasSuccess();
    });

  });

  // test inventory unit
  describe('Units', () => {
    // navigate to the page
    before(() => helpers.navigate(url));

    it('Successfully creates a new inventory unit', () => {
      element(by.css('[data-create-unit]')).click();
      FU.input('$ctrl.session.text', unit.text);
      FU.buttons.submit();
      components.notification.hasSuccess();
    });

    it('Successfully updates an existing inventory unit', () => {
      element(by.css('[data-edit-unit="' + unit.text +'"]')).click();
      FU.input('$ctrl.session.text', updateUnit.text);
      FU.buttons.submit();
      components.notification.hasSuccess();
    });

    it('Successfully deletes an existing inventory unit', () => {
      element(by.css('[data-delete-unit="' + unit.text +'"]')).click();
      FU.buttons.submit();
      components.notification.hasSuccess();
    });
  });
});
