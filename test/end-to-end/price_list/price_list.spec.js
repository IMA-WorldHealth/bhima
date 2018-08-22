/* global element, by */

/**
 * @todo - this page is complex enough to merit a PriceList page object.
 */
const chai = require('chai');
const helpers = require('../shared/helpers');

helpers.configure(chai);

const FU = require('../shared/FormUtils');
const components = require('../shared/components');
const PriceListPage = require('./price_list.page');

describe('Price Lists', () => {
  const path = '#!/prices';
  const page = new PriceListPage();

  before(() => helpers.navigate(path));

  it('creates a simple price list', () => {
    const list = {
      label       : 'Price list without Items',
      description : 'Description of price list without an item.',
    };

    page.openCreateModal();

    FU.input('$ctrl.priceList.label', list.label);
    FU.input('$ctrl.priceList.description', list.description);

    // submit the page to the server
    FU.buttons.submit();
    components.notification.hasSuccess();
  });

  it('updates a price list', () => {
    const list = {
      label : 'Price list without Items updated',
    };

    page.editPriceList(0);
    FU.input('$ctrl.priceList.label', list.label);

    // submit the page to the server
    FU.buttons.submit();
    components.notification.hasSuccess();
  });

  it('prices should add a price list item', () => {
    const priceListItem = {
      value   : 50,
      label : 'test item label',
      is_percentage : 1,
      inventoryLabel : 'Pyrazinamide 500mg',
    };

    page.editItems(0);

    FU.input('ModalCtrl.data.label', priceListItem.label);
    FU.input('ModalCtrl.data.value', priceListItem.value);
    element(by.model('ModalCtrl.data.is_percentage')).click();
    FU.uiSelect('ModalCtrl.data.inventory_uuid', priceListItem.inventoryLabel);
    // submit the page to the server
    FU.buttons.submit();
    FU.buttons.cancel();
    components.notification.hasSuccess();
  });

  it('prices should delete a price list item', () => {
    page.editItems(0);
    page.deletePriceListItem(0);
    FU.buttons.submit();
    FU.buttons.cancel();
    components.notification.hasSuccess();
  });
});
