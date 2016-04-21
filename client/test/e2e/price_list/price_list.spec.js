/* jshint expr:true */
/* global element, by, browser */

var chai = require('chai');
var expect = chai.expect;

var FU = require('../shared/FormUtils');
var helpers = require('../shared/helpers');
var components = require('../shared/components');

helpers.configure(chai);

describe('Price List Module', function () {
  'use strict';

  var path = '#/prices';

  var priceList = {
      label : 'Price list without Item',
      description : 'Description of price list without Item'
  };

  var priceList2 = {
      label : 'Price list with 2 items '
  };

  var item1 = {
    label : 'Item 1',
    value : 15
  };

  var item2 = {
    label : 'Item 2',
    value : 30
  };

  var item3 = {
    label : 'Item 3',
    value : 45
  };

  var item4 = {
    label : 'Item 4',
    value : 60
  };

  var defaultPriceList = 1;
  var priceListID1 = 1;
  var priceListID2 = 2;


  // navigate to the PriceList module before each test
  beforeEach(function () {
    browser.get(path);
  });

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

  it('successfully Add price_list_items to a price list', function () {
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
    // Saving Item
    element(by.id('submit-price-list')).click();
    FU.buttons.submit();
    // expect a nice validation message
    FU.exists(by.id('update_success'), true);

  });

  it('Prices should create a price list with two items', function () {
    // swtich to the create form
    FU.buttons.create();
    FU.input('PriceListCtrl.priceList.label', priceList2.label);

    element(by.id('add_item')).click();
    FU.input('ModalCtrl.data.label', item3.label);
    FU.input('ModalCtrl.data.value', item3.value);

    // select an Invetory
    FU.select('ModalCtrl.data.inventory_uuid')
      .enabled()
      .first()
      .click();
    // Saving Item
    element(by.id('submit-price-list')).click();

    element(by.id('add_item')).click();
    FU.input('ModalCtrl.data.label', item4.label);
    FU.input('ModalCtrl.data.value', item4.value);
    element(by.id('is_percentage')).click();
    // select an Invetory
    FU.select('ModalCtrl.data.inventory_uuid')
      .enabled()
      .first()
      .click();
    // Saving Item
    element(by.id('submit-price-list')).click();
    FU.buttons.submit();
    // expect a nice validation message
    FU.exists(by.id('create_success'), true);
  });

  it('Successfully edit a price list ', function () {
    element(by.id('price_list_' + priceListID1 )).click();
    FU.input('PriceListCtrl.priceList.label', ' Update');
    FU.input('PriceListCtrl.priceList.description', 'Added description of a price list');

    element(by.id('remove_item_1')).click();

    // swtich to the create form
    element(by.id('add_item')).click();
    FU.input('ModalCtrl.data.label', item1.label);
    FU.input('ModalCtrl.data.value', item1.value);

    // select an Invetory
    FU.select('ModalCtrl.data.inventory_uuid')
      .enabled()
      .first()
      .click();
    // Saving Item
    element(by.id('submit-price-list')).click();

    FU.buttons.submit();
    // expect a nice validation message
    FU.exists(by.id('update_success'), true);
  });

  it('successfully delete a PriceList', function () {
    element(by.id('price_delete_' + priceListID1 )).click();

    // accept the alert
    browser.switchTo().alert().accept();

    // make sure that the delete message appears
    FU.exists(by.id('delete_success'), true);
  });


  it('correctly blocks invalid form submission with relevant error classes', function () {

    // switch to the create form
    element(by.id('create')).click();

    // Verify form has not been successfully submitted
    expect(browser.getCurrentUrl()).to.eventually.equal(browser.baseUrl + path);

    element(by.id('submit-priceList')).click();

    // the following fields should be required
    FU.validation.error('PriceListCtrl.priceList.label');

    // the following fields are not required
    FU.validation.ok('PriceListCtrl.priceList.description');
  });

});
