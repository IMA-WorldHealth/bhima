/* global element, by, inject, browser */
'use strict';

const uuid   = require('node-uuid');
const chai   = require('chai');
const expect = chai.expect;

const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
const components = require('../shared/components');

helpers.configure(chai);

describe('Inventory List ::', () => {
  'use strict';

  // navigate to the page
  before(() => helpers.navigate('#/inventory/list'));

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

  it('Successfully creates a new inventory item (metadata)', () => {
    FU.buttons.create();
    FU.input('$ctrl.session.label', metadata.text);
    FU.input('$ctrl.session.code', metadata.code);
    element(by.model('$ctrl.session.consumable')).click();
    FU.input('$ctrl.session.price', metadata.price);
    FU.select('$ctrl.session.group', metadata.group);
    FU.select('$ctrl.session.type', metadata.type);
    FU.select('$ctrl.session.unit', metadata.unit);
    FU.input('$ctrl.session.unit_weight', metadata.unit_weight);
    FU.input('$ctrl.session.unit_volume', metadata.unit_volume);
    FU.buttons.submit();
    components.notification.hasSuccess();
  });

  it('Successfully updates an existing inventory item (metadata)', () => {
    element(by.css('[data-edit-metadata="' + metadata.text + '"]')).click();
    FU.input('$ctrl.session.label', metadataUpdate.text);
    FU.input('$ctrl.session.code', metadataUpdate.code);
    element(by.model('$ctrl.session.consumable')).click();
    FU.input('$ctrl.session.price', metadataUpdate.price);
    FU.select('$ctrl.session.group', metadataUpdate.group);
    FU.select('$ctrl.session.type', metadataUpdate.type);
    FU.select('$ctrl.session.unit', metadataUpdate.unit);
    FU.input('$ctrl.session.unit_weight', metadataUpdate.unit_weight);
    FU.input('$ctrl.session.unit_volume', metadataUpdate.unit_volume);
    FU.buttons.submit();
    components.notification.hasSuccess();
  });

});
