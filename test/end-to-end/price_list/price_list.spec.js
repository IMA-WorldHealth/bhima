const helpers = require('../shared/helpers');

const FU = require('../shared/FormUtils');
const components = require('../shared/components');
const PriceListPage = require('./price_list.page');
const PriceListItemsModal = require('./PriceListItemsModal.page');

const PRICE_LIST_ITEM_CSV_FILE = 'import-inventory-item-template.csv';

describe('Price Lists', () => {
  const path = '#!/prices';
  const page = new PriceListPage();
  const modal = new PriceListItemsModal();
  before(() => helpers.navigate(path));

  const list = {
    label       : 'Price list without Items',
    description : 'Description of price list without an item.',
  };

  const updateListLabel = 'Price list without Items updated';

  const priceListItem = {
    value   : 50,
    label : 'Upcharge Zinc Oxide',
    is_percentage : 1,
    inventoryLabel : 'Oxyde de zinc, 10%, pommade, 50g, pot, Unité',
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
    await modal.remove(priceListItem.label);
    await modal.submit();
    await modal.close();

    await components.notification.hasSuccess();
  });

  // import custom ohada accounts
  it('import price list item from csv file into the system', async () => {
    await page.importItems(updateListLabel);
    await modal.uploadFile(PRICE_LIST_ITEM_CSV_FILE);
    await FU.modal.submit();
    await components.notification.hasSuccess();
  });

});
