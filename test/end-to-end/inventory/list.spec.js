/* global element, by */

const GU = require('../shared/GridUtils');
const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
const components = require('../shared/components');

const Filters = require('../shared/components/bhFilters');
const SearchModal = require('../shared/search.page');

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
    group : 'Produits Injectables',
    type  : 'Article',
    unit  : 'Act',
    unit_weight : 1,
    unit_volume : 1,
    purchase_interval : 1,
    tags : 'Medicament Traceur',
  };

  const metadataUpdate = {
    text : 'Stavudine 40mg + Lamuvidune 150mg, ces, 60, vrac',
    price : 7.77,
    group : 'Produits Injectables',
    type  : 'Article',
    unit  : 'Pill',
    unit_weight : 7,
    unit_volume : 7,
    tags : 'Virologie',
  };

  const metadataSearch = {
    label : 'Quinine',
    group : 'Eau',
    type  : 'Article',
    tag   : 'Medicament Traceur',
    tags  : ['Medicament Traceur', 'Virologie'],
  };

  it('successfully creates a new inventory item (metadata)', async () => {

    // filter inventory size  to 5 so it takes less time to load
    await SearchModal.open();
    let modal = new SearchModal('inventory-search');
    await modal.switchToDefaultFilterTab();
    await FU.input('ModalCtrl.defaultQueries.limit', 5, SearchModal.element);
    await modal.submit();

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
    await FU.input('$ctrl.item.purchase_interval', metadata.purchase_interval);
    await components.tagSelect.set(metadata.tags);

    await FU.modal.submit();

    await components.notification.hasSuccess();

    await SearchModal.open();
    modal = new SearchModal('inventory-search');
    await modal.switchToDefaultFilterTab();
    await FU.input('ModalCtrl.defaultQueries.limit', 1000, SearchModal.element);
    await modal.submit();
  });

  const CODE_TO_UPDATE = 'DARV_LSTA4T6_0';

  it('successfully updates an existing inventory item (metadata)', async () => {

    // since we have thousands of inventory items, first we need to filter to find it.
    await FU.buttons.search();
    await FU.input('ModalCtrl.searchQueries.code', CODE_TO_UPDATE);
    await FU.modal.submit();

    await GU.expectRowCount('inventoryListGrid', 1);

    // now we can actually update it.

    const row = $(`[data-row-item="${CODE_TO_UPDATE}"]`);
    await row.$('[data-method="action"]').click();
    await element(by.css(`[data-edit-metadata="${CODE_TO_UPDATE}"]`)).click();

    await FU.input('$ctrl.item.label', metadataUpdate.text);
    await element(by.model('$ctrl.item.consumable')).click();
    await FU.input('$ctrl.item.price', metadataUpdate.price);
    await FU.select('$ctrl.item.group_uuid', metadataUpdate.group);
    await FU.select('$ctrl.item.type_id', metadataUpdate.type);
    await FU.select('$ctrl.item.unit_id', metadataUpdate.unit);
    await FU.input('$ctrl.item.unit_weight', metadataUpdate.unit_weight);
    await FU.input('$ctrl.item.unit_volume', metadataUpdate.unit_volume);
    await components.tagSelect.set(metadataUpdate.tags);

    await FU.modal.submit();

    await components.notification.hasSuccess();

    // finally, clear the filters
    await filters.resetFilters();
  });

  // demonstrates that filtering works
  it(`should find 21 inventory items with the label "${metadataSearch.label}"`, async () => {
    await FU.buttons.search();

    await FU.input('ModalCtrl.searchQueries.text', metadataSearch.label);
    await FU.modal.submit();

    await GU.expectRowCount('inventoryListGrid', 21);
    await filters.resetFilters();
  });

  // demonstrates that filtering works
  // eslint-disable-next-line
  it(`should find 17 inventory items with group "${metadataSearch.group}" and type "${metadataSearch.type}"`, async () => {
    await FU.buttons.search();

    await components.inventoryGroupSelect.set(metadataSearch.group);
    await components.inventoryTypeSelect.set(metadataSearch.type);
    await FU.modal.submit();

    await GU.expectRowCount('inventoryListGrid', 17);
    await filters.resetFilters();
  });

  it(`should find 1 inventory item with tag string "${metadataSearch.tag}"`, async () => {
    await FU.buttons.search();

    await components.tagSelect.set(metadataSearch.tag);
    await FU.modal.submit();

    await GU.expectRowCount('inventoryListGrid', 1);
    await filters.resetFilters();
  });

  it(`should find 2 inventory items within this tags array [${metadataSearch.tags}]`, async () => {
    await FU.buttons.search();

    await components.tagSelect.set(metadataSearch.tags);
    await FU.modal.submit();

    await GU.expectRowCount('inventoryListGrid', 2);
    await filters.resetFilters();
  });

  it('doesn\'t create a new inventory item (metadata) for invalid data', async () => {
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
