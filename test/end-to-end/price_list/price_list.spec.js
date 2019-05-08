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


  it('prices should create a price list', async () => {
    await page.create();

    await FU.input('$ctrl.priceList.label', list.label);
    await FU.input('$ctrl.priceList.description', list.description);

    await FU.modal.submit();
    await components.notification.hasSuccess();
  });

  it('prices should update a price list', async () => {
    await page.update(list.label);

    await FU.input('$ctrl.priceList.label', updateListLabel);

    await FU.modal.submit();
    await components.notification.hasSuccess();
  });

  it('prices should add a price list item', async () => {
    await page.configure(updateListLabel);

    const modal = new PriceListItemsModal();

    await modal.setLabel(priceListItem.label);
    await modal.setValue(priceListItem.value);
    await modal.setIsPercentage(priceListItem.is_percentage);
    await modal.setInventory(priceListItem.inventoryLabel);

    await modal.submit();
    await modal.close();

    await components.notification.hasSuccess();
  });

  it('prices should delete a price list item', async () => {
    await page.configure(updateListLabel);

    const modal = new PriceListItemsModal();
    await modal.remove(priceListItem.label);
    await modal.submit();
    await modal.close();

    await components.notification.hasSuccess();
  });
});
