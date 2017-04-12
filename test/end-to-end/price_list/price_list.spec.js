/* global element, by, browser */

/**
 * @todo - this page is complex enough to merit a PriceList page object.
 */
const chai = require('chai');
const helpers = require('../shared/helpers');

helpers.configure(chai);

const FU = require('../shared/FormUtils');
const components = require('../shared/components');

describe.only('Price Lists', () => {
  const path = '#!/prices';
  before(() => helpers.navigate(path));

  const priceList2 = {
    label : 'Price list with two items',
  };

  const item1 = {
    label : 'Item 1',
    value : 15,
  };

  const item2 = {
    label : 'Item 2',
    value : 30,
  };

  const item3 = {
    label : 'Item 3',
    value : 45,
  };

  const item4 = {
    label : 'Item 4',
    value : 60,
  };

  const item5 = {
    label : 'Item 5',
    value : 75,
  };

  const priceListID1 = 1;

  it('prices should create a price list without price list items', () => {
    const list = {
      label       : 'Price list without Items',
      description : 'Description of price list without an item.',
    };

    FU.buttons.create();

    FU.input('PriceListCtrl.priceList.label', list.label);
    FU.input('PriceListCtrl.priceList.description', list.description);

    // submit the page to the server
    FU.buttons.submit();
    components.notification.hasSuccess();
  });

  it('add price_list_items to a price list', () => {
    element(by.id(`price_list_${priceListID1}`)).click();

    element(by.id('add_item')).click();
    FU.input('ModalCtrl.data.label', item1.label);
    FU.input('ModalCtrl.data.value', item1.value);
    element(by.id('is_percentage')).click();
    FU.uiSelect('ModalCtrl.data.inventory_uuid', 'First Test Inventory Item');

    element(by.id('submit-price-list')).click();

    element(by.id('add_item')).click();
    FU.input('ModalCtrl.data.label', item2.label);
    FU.input('ModalCtrl.data.value', item2.value);
    FU.uiSelect('ModalCtrl.data.inventory_uuid', 'Second Test Inventory Item');

    element(by.id('submit-price-list')).click();

    FU.buttons.submit();
    components.notification.hasSuccess();
  });

  it('prices should create a price list with two items', () => {
    FU.buttons.create();

    FU.input('PriceListCtrl.priceList.label', priceList2.label);

    // select an inventory item
    element(by.id('add_item')).click();
    FU.input('ModalCtrl.data.label', item3.label);
    FU.input('ModalCtrl.data.value', item3.value);
    FU.uiSelect('ModalCtrl.data.inventory_uuid', 'First Test Inventory Item');
    element(by.id('submit-price-list')).click();

    element(by.id('add_item')).click();
    FU.input('ModalCtrl.data.label', item4.label);
    FU.input('ModalCtrl.data.value', item4.value);
    element(by.id('is_percentage')).click();
    FU.uiSelect('ModalCtrl.data.inventory_uuid', 'Second Test Inventory Item');

    element(by.id('submit-price-list')).click();

    FU.buttons.submit();
    components.notification.hasSuccess();
  });

  it('edits a price list ', () => {
    element(by.id(`price_list_${priceListID1}`)).click();

    FU.input('PriceListCtrl.priceList.label', 'Updated List');
    FU.input('PriceListCtrl.priceList.description', 'Added description of a price list.');

    element(by.id('remove_item_1')).click();

    // switch to the create form
    element(by.id('add_item')).click();
    FU.input('ModalCtrl.data.label', item5.label);
    FU.input('ModalCtrl.data.value', item5.value);

    // select an inventory item
    FU.uiSelect('ModalCtrl.data.inventory_uuid', 'First Test Inventory Item');

    // saving item
    element(by.id('submit-price-list')).click();

    FU.buttons.submit();
    components.notification.hasSuccess();
  });

  it('deletes a price list', () => {
    element(by.id(`price_list_${priceListID1}`)).click();

    // click the "delete" button 
    FU.buttons.delete();

    // accept the alert
    components.modalAction.confirm();

    components.notification.hasSuccess();
  });

  it('blocks invalid form submission with relevant error classes', () => {
    FU.buttons.create();

    element(by.id('submit-priceList')).click();

    components.notification.hasDanger();

    // the following fields should be required
    FU.validation.error('PriceListCtrl.priceList.label');

    // the following fields are not required
    FU.validation.ok('PriceListCtrl.priceList.description');
  });
});
