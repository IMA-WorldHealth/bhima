const TU = require('../shared/TestUtils');
const { by } = require('../shared/TestUtils');

const GridRow = require('../shared/GridRow');

class UserPage {

  async count() {
    await TU.waitForSelector('.ui-grid-canvas .ui-grid-row');
    const grid = await TU.locator(by.id('users-grid'));
    return grid
      .locator('.ui-grid-render-container-body')
      .locator(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'))
      .count();
  }

  create() {
    return TU.buttons.create();
  }

  async update(name) {
    const row = new GridRow(name);
    await row.dropdown();
    return row.edit();
  }

  async updateDepot(name) {
    const row = new GridRow(name);
    await row.dropdown();
    return row.method('depot-management');
  }

  async updateCashbox(name) {
    const row = new GridRow(name);
    await row.dropdown();
    return row.method('cashbox');
  }

  async toggleUser(name, on = true) {
    const row = new GridRow(name);
    await row.dropdown();
    return row.method(on ? 'activate' : 'deactivate');
  }
}

module.exports = UserPage;
