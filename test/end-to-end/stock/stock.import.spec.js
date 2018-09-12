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

  it('importing stock from a csv file', () => {
    shared.setDepot(depot);

    shared.uploadFile(STOCK_CSV_FILE);

    FU.buttons.submit();
    components.notification.hasSuccess();
  });

  it('importing stock from a csv file which have inventory_code and inventory_cmm missing', () => {
    shared.setDepot(depot);

    shared.uploadFile(STOCK_CSV_FILE_NO_CODE_NO_CMM);

    FU.buttons.submit();
    components.notification.hasSuccess();
  });

}

describe('Stock Import', StockImportTests);
