/* global element, by, browser */

/**
 * @todo - this page is complex enough to merit a PriceList page object.
 */
const chai = require('chai');
const expect = chai.expect;
const helpers = require('../shared/helpers');
helpers.configure(chai);

const FU = require('../shared/FormUtils');
const components = require('../shared/components');

describe('Price Lists', function () {
  'use strict';

  const path = '#/prices';
  before(() => helpers.navigate(path));

  const priceList2 = {
    label : 'Price list with two items'
  };

  const item1 = {
    label : 'Item 1',
    value : 15
  };

  const item2 = {
    label : 'Item 2',
    value : 30
  };

  const item3 = {
    label : 'Item 3',
    value : 45
  };

  const item4 = {
    label : 'Item 4',
    value : 60
  };

  const priceListID1 = 1;
  const priceListID2 = 2;

  it('prices should create a price list without price list items', function () {
    const list = {
      label: 'Price list without Items',
      description: 'Description of price list without an item.'
    };

    FU.buttons.create();

    FU.input('PriceListCtrl.priceList.label', list.label);
    FU.input('PriceListCtrl.priceList.description', list.description);

    // submit the page to the server
    FU.buttons.submit();
    FU.exists(by.id('create_success'), true);
  });

  it('add price_list_items to a price list', function () {
    element(by.id('price_list_' + priceListID1 )).click();
    element(by.id('add_item')).click();
    FU.input('ModalCtrl.data.label', item1.label);
    FU.input('ModalCtrl.data.value', item1.value);
    element(by.id('is_percentage')).click();

    // select an Invetory
    FU.select('ModalCtrl.data.inventory_uuid', 'Test Inventory Item');
    element(by.id('submit-price-list')).click();

    element(by.id('add_item')).click();
    FU.input('ModalCtrl.data.label', item2.label);
    FU.input('ModalCtrl.data.value', item2.value);

    // select an Invetory
    FU.select('ModalCtrl.data.inventory_uuid', 'Second Test Inventory Item');

    // saving item
    element(by.id('submit-price-list')).click();
    FU.buttons.submit();

    // expect a nice validation message
    FU.exists(by.id('update_success'), true);
  });

  it('prices should create a price list with two items', function () {
    FU.buttons.create();

    FU.input('PriceListCtrl.priceList.label', priceList2.label);

    // select an inventory item
    element(by.id('add_item')).click();
    FU.input('ModalCtrl.data.label', item3.label);
    FU.input('ModalCtrl.data.value', item3.value);
    FU.select('ModalCtrl.data.inventory_uuid', 'Test Inventory Item');
    element(by.id('submit-price-list')).click();

    element(by.id('add_item')).click();
    FU.input('ModalCtrl.data.label', item4.label);
    FU.input('ModalCtrl.data.value', item4.value);
    element(by.id('is_percentage')).click();
    FU.select('ModalCtrl.data.inventory_uuid', 'Test Inventory Item');
    FU.select('ModalCtrl.data.inventory_uuid', 'Second Test Inventory Item');

    element(by.id('submit-price-list')).click();

    FU.buttons.submit();
    FU.exists(by.id('create_success'), true);
  });

  it('edits a price list ', function () {
    element(by.id('price_list_' + priceListID1 )).click();

    FU.input('PriceListCtrl.priceList.label', 'Updated List');
    FU.input('PriceListCtrl.priceList.description', 'Added description of a price list.');

    element(by.id('remove_item_1')).click();

    // switch to the create form
    element(by.id('add_item')).click();
    FU.input('ModalCtrl.data.label', item1.label);
    FU.input('ModalCtrl.data.value', item1.value);

    // select an inventory item
    FU.select('ModalCtrl.data.inventory_uuid', 'Test Inventory Item');

    // saving item
    element(by.id('submit-price-list')).click();

    FU.buttons.submit();
    FU.exists(by.id('update_success'), true);
  });

  it('deletes a price list', function () {
    element(by.id('price_delete_' + priceListID1 )).click();

    // accept the alert
    components.modalAction.confirm();

    // make sure that the delete message appears
    FU.exists(by.id('delete_success'), true);
  });


  it('blocks invalid form submission with relevant error classes', function () {
    element(by.id('create')).click();

    // verify form has not been submitted
    expect(helpers.getCurrentPath()).to.eventually.equal(path);

    element(by.id('submit-priceList')).click();

    // the following fields should be required
    FU.validation.error('PriceListCtrl.priceList.label');

    // the following fields are not required
    FU.validation.ok('PriceListCtrl.priceList.description');
  });
});
