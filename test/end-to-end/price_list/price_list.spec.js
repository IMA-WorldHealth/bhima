/* global element, by */

const helpers = require('../shared/helpers');

const FU = require('../shared/FormUtils');
const components = require('../shared/components');
const PriceListPage = require('./price_list.page');
const PriceListItemsModal = require('./PriceListItemsModal.page');

describe('Price Lists', () => {
  const path = '#!/prices';
  const page = new PriceListPage();

  before(() => helpers.navigate(path));

  const list = {
    label       : 'Price list without Items',
    description : 'Description of price list without an item.',
  };

  const updateListLabel = 'Price list without Items updated';

  const priceListItem = {
    value   : 50,
    label : 'Test Item Label',
    is_percentage : 1,
    inventoryLabel : 'Pyrazinamide 500mg',
  };


  it('prices should create a price list', () => {
    page.create();

    FU.input('$ctrl.priceList.label', list.label);
    FU.input('$ctrl.priceList.description', list.description);

    FU.modal.submit();
    components.notification.hasSuccess();
  });

  it('prices should update a price list', () => {
    page.update(list.label);

    FU.input('$ctrl.priceList.label', updateListLabel);

    FU.modal.submit();
    components.notification.hasSuccess();
  });

  it('prices should add a price list item', () => {
    page.configure(updateListLabel);

    const modal = new PriceListItemsModal();

    modal.setLabel(priceListItem.label);
    modal.setValue(priceListItem.value);
    modal.setIsPercentage(priceListItem.is_percentage);
    modal.setInventory(priceListItem.inventoryLabel);

    modal.submit();
    modal.close();

    components.notification.hasSuccess();
  });

  it('prices should delete a price list item', () => {
    page.configure(updateListLabel);

    const modal = new PriceListItemsModal();
    modal.remove(priceListItem.label);
    modal.submit();
    modal.close();

    components.notification.hasSuccess();
  });
});
