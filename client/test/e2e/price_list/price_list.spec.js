/* global element, by, inject, browser */
const chai = require('chai');
const expect = chai.expect;

const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
helpers.configure(chai);

const components = require('../shared/components');

describe('Price List Module', function () {
  'use strict';

  const path = '#/prices';
  before(() => browser.get(path));

  const priceList = {
    label : 'Price list without Items',
    description : 'Description of price list without Item'
  };

  const priceList2 = {
    label : 'Price list with 2 items '
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

  const defaultPriceList = 1;
  const priceListID1 = 1;
  const priceListID2 = 2;

  it('prices should create a price list without price list items', function () {
    // swtich to the create form
    FU.buttons.create();
    FU.input('PriceListCtrl.priceList.label', priceList.label);
    FU.input('PriceListCtrl.priceList.description', priceList.description);

    // submit the page to the server
    FU.buttons.submit();
    // expect a nice validation message
    FU.exists(by.id('create_success'), true);
  });

  it('successfully add price_list_items to a price list', function () {
    element(by.id('price_list_' + priceListID1 )).click();
    element(by.id('add_item')).click();
    FU.input('ModalCtrl.data.label', item1.label);
    FU.input('ModalCtrl.data.value', item1.value);
    element(by.id('is_percentage')).click();

    // select an Invetory
    FU.select('ModalCtrl.data.inventory_uuid')
      .enabled()
      .first()
      .click();
    // Saving Item
    element(by.id('submit-price-list')).click();

    element(by.id('add_item')).click();
    FU.input('ModalCtrl.data.label', item2.label);
    FU.input('ModalCtrl.data.value', item2.value);

    // select an Invetory
    FU.select('ModalCtrl.data.inventory_uuid')
      .enabled()
      .first()
      .click();

    // saving item
    element(by.id('submit-price-list')).click();
    FU.buttons.submit();

    // expect a nice validation message
    FU.exists(by.id('update_success'), true);
  });

  it('prices should create a price list with two items', function () {
    // switch to the create form
    FU.buttons.create();
    FU.input('PriceListCtrl.priceList.label', priceList2.label);

    element(by.id('add_item')).click();
    FU.input('ModalCtrl.data.label', item3.label);
    FU.input('ModalCtrl.data.value', item3.value);

    // select an inventory item
    FU.select('ModalCtrl.data.inventory_uuid')
      .enabled()
      .first()
      .click();

    // saving item
    element(by.id('submit-price-list')).click();

    element(by.id('add_item')).click();
    FU.input('ModalCtrl.data.label', item4.label);
    FU.input('ModalCtrl.data.value', item4.value);
    element(by.id('is_percentage')).click();

    // select an inventory item
    FU.select('ModalCtrl.data.inventory_uuid')
      .enabled()
      .first()
      .click();

    // saving item
    element(by.id('submit-price-list')).click();
    FU.buttons.submit();

    // expect a nice validation message
    FU.exists(by.id('create_success'), true);
  });

  it('successfully edit a price list ', function () {
    element(by.id('price_list_' + priceListID1 )).click();
    FU.input('PriceListCtrl.priceList.label', ' Update');
    FU.input('PriceListCtrl.priceList.description', 'Added description of a price list');

    element(by.id('remove_item_1')).click();

    // switch to the create form
    element(by.id('add_item')).click();
    FU.input('ModalCtrl.data.label', item1.label);
    FU.input('ModalCtrl.data.value', item1.value);

    // select an inventory item
    FU.select('ModalCtrl.data.inventory_uuid')
      .enabled()
      .first()
      .click();

    // saving item
    element(by.id('submit-price-list')).click();

    FU.buttons.submit();
    // expect a nice validation message
    FU.exists(by.id('update_success'), true);
  });

  it('successfully delete a price list', function () {
    element(by.id('price_delete_' + priceListID1 )).click();

    // accept the alert
    components.modalAction.confirm();

    // make sure that the delete message appears
    FU.exists(by.id('delete_success'), true);
  });


  it('correctly blocks invalid form submission with relevant error classes', function () {

    // switch to the create form
    element(by.id('create')).click();

    // verify form has not been successfully submitted
    expect(helpers.getCurrentPath()).to.eventually.equal(path);

    element(by.id('submit-priceList')).click();

    // the following fields should be required
    FU.validation.error('PriceListCtrl.priceList.label');

    // the following fields are not required
    FU.validation.ok('PriceListCtrl.priceList.description');
  });
});
