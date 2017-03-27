/* global element, by, browser */
'use strict';

const uuid   = require('node-uuid');
const chai   = require('chai');
const expect = chai.expect;

const GU = require('../shared/GridUtils');
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
    group : 'Test inventory group',
    type  : 'Service',
    unit  : 'Pill',
    unit_weight : 7,
    unit_volume : 7
  };

  let metadataSearch = {
    label : 'First'
  };

  it('successfully creates a new inventory item (metadata)', () => {
    FU.buttons.create();
    FU.input('$ctrl.item.label', metadata.text);
    FU.input('$ctrl.item.code', metadata.code);
    element(by.model('$ctrl.item.consumable')).click();
    FU.input('$ctrl.item.price', metadata.price);
    FU.select('$ctrl.item.group_uuid', metadata.group);
    FU.select('$ctrl.item.type_id', metadata.type);
    FU.select('$ctrl.item.unit_id', metadata.unit);
    FU.input('$ctrl.item.unit_weight', metadata.unit_weight);
    FU.input('$ctrl.item.unit_volume', metadata.unit_volume);
    FU.modal.submit();
    components.notification.hasSuccess();
  });

  // demonstrates that filtering works
  it(`should find one Inventory with Label "${metadataSearch.label}"`, () => {
    element(by.id('research')).click();
    //FU.buttons.research();
    FU.input('ModalCtrl.params.text', metadataSearch.label);
    FU.modal.submit();

    GU.expectRowCount('inventoryListGrid', 1);
    FU.buttons.clear();
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
    FU.validation.error('$ctrl.item.group_uuid');
    FU.validation.error('$ctrl.item.type_id');
    FU.validation.error('$ctrl.item.unit_id');

    //components.notification.hasDanger();

    FU.buttons.cancel();
  });

  it('successfully updates an existing inventory item (metadata)', () => {
    let row = $(`[data-row-item="${metadata.code}"]`);
    row.$('[data-method="action"]').click();
    element(by.css(`[data-edit-metadata="${metadata.code}"]`)).click();

    FU.input('$ctrl.item.label', metadataUpdate.text);
    FU.input('$ctrl.item.code', metadataUpdate.code);
    element(by.model('$ctrl.item.consumable')).click();
    FU.input('$ctrl.item.price', metadataUpdate.price);
    FU.select('$ctrl.item.group_uuid', metadataUpdate.group);
    FU.select('$ctrl.item.type_id', metadataUpdate.type);
    FU.select('$ctrl.item.unit_id', metadataUpdate.unit);
    FU.input('$ctrl.item.unit_weight', metadataUpdate.unit_weight);
    FU.input('$ctrl.item.unit_volume', metadataUpdate.unit_volume);

    FU.modal.submit();
    components.notification.hasSuccess();
  });

});
