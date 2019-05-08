/* global element, by */

const GU = require('../shared/GridUtils');
const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
const components = require('../shared/components');

const Filters = require('../shared/components/bhFilters');

describe('Inventory List', () => {
  // navigate to the page
  before(() => helpers.navigate('#/inventory'));
  const filters = new Filters();
  const currentDate = new Date();
  const uniqueIdentifier = currentDate.getTime().toString();

  // inventory list items
  const metadata = {
    code  : uniqueIdentifier,
    text  : '[E2E] Inventory Article',
    price : 7.57,
    group : 'Injectable',
    type  : 'Article',
    unit  : 'Act',
    unit_weight : 1,
    unit_volume : 1,
  };

  const metadataUpdate = {
    code : uniqueIdentifier.concat('_updated'),
    text : '[E2E] Inventory Article Updated',
    price : 7.77,
    group : 'Injectable',
    type  : 'Service',
    unit  : 'Pill',
    unit_weight : 7,
    unit_volume : 7,
  };

  const metadataSearch = {
    label : 'Quinine',
    group : 'Injectable',
    type  : 'Article',
  };

  it('successfully creates a new inventory item (metadata)', async () => {
    await FU.buttons.create();
    await FU.input('$ctrl.item.label', metadata.text);
    await FU.input('$ctrl.item.code', metadata.code);
    await element(by.model('$ctrl.item.consumable')).click();
    await FU.input('$ctrl.item.price', metadata.price);
    await FU.select('$ctrl.item.group_uuid', metadata.group);
    await FU.select('$ctrl.item.type_id', metadata.type);
    await FU.select('$ctrl.item.unit_id', metadata.unit);
    await FU.input('$ctrl.item.unit_weight', metadata.unit_weight);
    await FU.input('$ctrl.item.unit_volume', metadata.unit_volume);
    await FU.modal.submit();
    await components.notification.hasSuccess();
  });

  const CODE_TO_UPDATE = '100001';
  it('successfully updates an existing inventory item (metadata)', async () => {
    const row = $(`[data-row-item="${CODE_TO_UPDATE}"]`);
    await row.$('[data-method="action"]').click();
    await element(by.css(`[data-edit-metadata="${CODE_TO_UPDATE}"]`)).click();

    await FU.input('$ctrl.item.label', metadataUpdate.text);
    await FU.input('$ctrl.item.code', metadataUpdate.code);
    await element(by.model('$ctrl.item.consumable')).click();
    await FU.input('$ctrl.item.price', metadataUpdate.price);
    await FU.select('$ctrl.item.group_uuid', metadataUpdate.group);
    await FU.select('$ctrl.item.type_id', metadataUpdate.type);
    await FU.select('$ctrl.item.unit_id', metadataUpdate.unit);
    await FU.input('$ctrl.item.unit_weight', metadataUpdate.unit_weight);
    await FU.input('$ctrl.item.unit_volume', metadataUpdate.unit_volume);

    await FU.modal.submit();
    components.notification.hasSuccess();
  });

  // demonstrates that filtering works
  it(`should find one Inventory with Label "${metadataSearch.label}"`, async () => {
    await element(by.id('research')).click();

    await FU.input('ModalCtrl.searchQueries.text', metadataSearch.label);
    await FU.modal.submit();

    await GU.expectRowCount('inventoryListGrid', 2);
    await filters.resetFilters();
  });


  // demonstrates that filtering works
  it(`should find three Inventory with Group "${metadataSearch.group}" and Type "${metadataSearch.type}"`, async () => {
    await element(by.id('research')).click();

    await components.inventoryGroupSelect.set(metadataSearch.group);
    await components.inventoryTypeSelect.set(metadataSearch.type);
    await FU.modal.submit();

    await GU.expectRowCount('inventoryListGrid', 1);
    await filters.resetFilters();
  });


  it('dont creates a new inventory item (metadata) for invalid data', async () => {
    await FU.buttons.create();
    await FU.input('$ctrl.item.label', metadata.text);
    await FU.input('$ctrl.item.unit_weight', metadata.unit_weight);
    await FU.input('$ctrl.item.unit_volume', metadata.unit_volume);
    await FU.modal.submit();

    // check validations
    await FU.validation.ok('$ctrl.item.label');
    await FU.validation.ok('$ctrl.item.unit_weight');
    await FU.validation.ok('$ctrl.item.unit_volume');
    await FU.validation.error('$ctrl.item.code');
    await FU.validation.error('$ctrl.item.price');
    await FU.validation.error('$ctrl.item.group_uuid');
    await FU.validation.error('$ctrl.item.type_id');
    await FU.validation.error('$ctrl.item.unit_id');
    await FU.buttons.cancel();
  });
});
