const FU = require('../shared/FormUtils');
const GridRow = require('../shared/GridRow');

class PriceListPage {
  constructor() {
    this.gridId = 'priceList-grid';
    this.buttons = {
      create : FU.buttons.create,
    };
  }

  create() {
    return this.buttons.create();
  }

  async update(label) {
    const row = new GridRow(label);
    await row.dropdown().click();
    await row.edit().click();
  }

  async remove(label) {
    const row = new GridRow(label);
    await row.dropdown().click();
    await row.remove().click();
  }

  // opens the items menu for configuration
  async configure(label) {
    const row = new GridRow(label);
    await row.dropdown().click();
    await row.method('edit-items').click();
  }

  async importItems(label) {
    const row = new GridRow(label);
    await row.dropdown().click();
    await row.method('import-items').click();
  }
}

module.exports = PriceListPage;
