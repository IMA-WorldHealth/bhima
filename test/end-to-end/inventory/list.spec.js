/* global element, by, browser */
'use strict';

const uuid   = require('node-uuid');
const chai   = require('chai');
const expect = chai.expect;

const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
const components = require('../shared/components');

helpers.configure(chai);

describe('Inventory List', () => {

  // navigate to the page
  before(() => helpers.navigate('#/inventory'));

  let currentDate = new Date();
  let uniqueIdentifier = currentDate.getTime().toString();

  // inventory list items
  let metadata = {
    code  : uniqueIdentifier,
    text  : '[E2E] Inventory Article',
    price : 7.57,
    group : 'Test inventory group',
    type  : 'Article',
    unit  : 'Act',
    unit_weight : 1,
    unit_volume : 1
  };

  let metadataUpdate = {
    code : uniqueIdentifier.concat('_updated'),
    text : '[E2E] Inventory Article updated',
    price : 7.77,
    group : 'Inventory Group',
    type  : 'Service',
    unit  : 'Pill',
    unit_weight : 7,
    unit_volume : 7
  };

  it('successfully creates a new inventory item (metadata)', () => {
    FU.buttons.create();
    FU.input('$ctrl.item.label', metadata.text);
    FU.input('$ctrl.item.code', metadata.code);
    element(by.model('$ctrl.item.consumable')).click();
    FU.input('$ctrl.item.price', metadata.price);
    FU.select('$ctrl.item.group', metadata.group);
    FU.select('$ctrl.item.type', metadata.type);
    FU.select('$ctrl.item.unit', metadata.unit);
    FU.input('$ctrl.item.unit_weight', metadata.unit_weight);
    FU.input('$ctrl.item.unit_volume', metadata.unit_volume);
    FU.modal.submit();
    components.notification.hasSuccess();
  });

  it('dont creates a new inventory item (metadata) for invalid data', () => {
    FU.buttons.create();
    FU.input('$ctrl.item.label', metadata.text);
    FU.input('$ctrl.item.unit_weight', metadata.unit_weight);
    FU.input('$ctrl.item.unit_volume', metadata.unit_volume);
    FU.modal.submit();

    // check validations
    FU.validation.ok('$ctrl.item.label');
    FU.validation.ok('$ctrl.item.unit_weight');
    FU.validation.ok('$ctrl.item.unit_volume');
    FU.validation.error('$ctrl.item.code');
    FU.validation.error('$ctrl.item.price');
    FU.validation.error('$ctrl.item.group');
    FU.validation.error('$ctrl.item.type');
    FU.validation.error('$ctrl.item.unit');

    //components.notification.hasDanger();

    FU.buttons.cancel();
  });

  it('successfully updates an existing inventory item (metadata)', () => {
    element(by.css(`[data-edit-metadata="${metadata.code}"]`)).click();
    FU.input('$ctrl.item.label', metadataUpdate.text);
    FU.input('$ctrl.item.code', metadataUpdate.code);
    element(by.model('$ctrl.item.consumable')).click();
    FU.input('$ctrl.item.price', metadataUpdate.price);
    FU.select('$ctrl.item.group', metadataUpdate.group);
    FU.select('$ctrl.item.type', metadataUpdate.type);
    FU.select('$ctrl.item.unit', metadataUpdate.unit);
    FU.input('$ctrl.item.unit_weight', metadataUpdate.unit_weight);
    FU.input('$ctrl.item.unit_volume', metadataUpdate.unit_volume);

    FU.modal.submit();
    components.notification.hasSuccess();
  });
});
