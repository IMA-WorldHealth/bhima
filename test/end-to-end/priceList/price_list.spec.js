const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../shared/TestUtils');

const PriceListPage = require('./price_list.page');
const PriceListItemsModal = require('./PriceListItemsModal.page');

const components = require('../shared/components');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

const PRICE_LIST_ITEM_CSV_FILE = 'import-inventory-item-template.csv';

test.describe('Price Lists', () => {
  const path = '/#!/prices';
  const page = new PriceListPage();
  const modal = new PriceListItemsModal();

  test.beforeEach(async () => {
    await TU.navigate(path);
  });

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

  test('prices should create a price list', async () => {
    await page.create();

    await TU.input('$ctrl.priceList.label', list.label);
    await TU.input('$ctrl.priceList.description', list.description);

    await TU.modal.submit();
    await components.notification.hasSuccess();
  });

  test('prices should update a price list', async () => {
    await page.update(list.label);

    await TU.input('$ctrl.priceList.label', updateListLabel);

    await TU.modal.submit();
    await components.notification.hasSuccess();
  });

  test('prices should add a price list item', async () => {
    await page.configure(updateListLabel);

    await modal.setLabel(priceListItem.label);
    await modal.setValue(priceListItem.value);
    await modal.setIsPercentage(priceListItem.is_percentage);
    await modal.setInventory(priceListItem.inventoryLabel);
    await modal.submit();

    // Note that the success message appears below the dialog, so close it first
    await modal.close();
    await components.notification.hasSuccess();
  });

  test('prices should delete a price list item', async () => {
    await page.configure(updateListLabel);
    await modal.remove(priceListItem.label);
    await modal.confirm();
    await modal.close();

    await components.notification.hasSuccess();
  });

  // import custom OHADA accounts
  test('import price list item from csv file into the system', async () => {
    await page.importItems(updateListLabel);
    await modal.uploadFile(PRICE_LIST_ITEM_CSV_FILE);
    await TU.modal.submit();
    await components.notification.hasSuccess();
  });

});
