const helpers = require('../shared/helpers');
const components = require('../shared/components');
const FU = require('../shared/FormUtils');
const shared = require('./stock.shared.page');

function StockImportTests() {
  const STOCK_CSV_FILE = 'stock-to-import.csv';
  const STOCK_CSV_FILE_NO_CODE_NO_CMM = 'stock-to-import-missing-column.csv';
  const depot = 'Depot Principal';

  // navigate to the page
  beforeEach(() => helpers.navigate('#/stock/import'));

  it('importing stock from a csv file', async () => {
    await shared.setDepot(depot);

    await components.dateEditor.set(new Date());

    await shared.uploadFile(STOCK_CSV_FILE);

    await FU.buttons.submit();
    await components.notification.hasSuccess();
  });

  it('importing stock from a csv file which have inventory_code and inventory_cmm missing', async () => {
    await shared.setDepot(depot);

    await components.dateEditor.set(new Date());

    await shared.uploadFile(STOCK_CSV_FILE_NO_CODE_NO_CMM);

    await FU.buttons.submit();
    await components.notification.hasSuccess();
  });
}

module.exports = StockImportTests;
