/* eslint class-methods-use-this:off */
const FU = require('../shared/FormUtils');
/* loading grid actions */
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

  update(label) {
    const row = new GridRow(label);
    row.dropdown().click();
    row.edit().click();
  }

  remove(label) {
    const row = new GridRow(label);
    row.dropdown().click();
    row.remove().click();
  }

  // opens the items menu for configuration
  configure(label) {
    const row = new GridRow(label);
    row.dropdown().click();
    row.method('edit-items').click();
  }
}

module.exports = PriceListPage;
