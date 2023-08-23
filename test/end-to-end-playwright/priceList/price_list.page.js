const TU = require('../shared/TestUtils');
const GridRow = require('../shared/GridRow');

class PriceListPage {
  constructor() {
    this.gridId = 'priceList-grid';
    this.buttons = {
      create : TU.buttons.create,
    };
  }

  create() {
    return this.buttons.create();
  }

  async update(label) {
    const row = new GridRow(label);
    await row.dropdown();
    return row.edit();
  }

  async remove(label) {
    const row = new GridRow(label);
    await row.dropdown();
    return row.remove();
  }

  // opens the items menu for configuration
  async configure(label) {
    const row = new GridRow(label);
    await row.dropdown();
    return row.method('edit-items');
  }

  async importItems(label) {
    const row = new GridRow(label);
    await row.dropdown();
    return row.method('import-items');
  }

}

module.exports = PriceListPage;
