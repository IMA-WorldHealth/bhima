/* global element, by */
/* eslint  */

const GridRow = require('../shared/GridRow');
const FU = require('../shared/FormUtils');

class UserPage {
  constructor() {
    this.grid = element(by.id('users-grid'));
    this.buttons = {
      create : FU.buttons.create,
    };
  }

  count() {
    return this.grid
      .element(by.css('.ui-grid-render-container-body'))
      .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'))
      .count();
  }

  create() {
    return this.buttons.create();
  }

  async update(name) {
    const row = new GridRow(name);
    await row.dropdown().click();
    await row.edit().click();
  }

  async updateDepot(name) {
    const row = new GridRow(name);
    await row.dropdown().click();
    await row.menu.$('[data-method="depot"]').click();
  }

  async updateCashbox(name) {
    const row = new GridRow(name);
    await row.dropdown().click();
    await row.menu.$('[data-method="cashbox"]').click();
  }

  async toggleUser(name, on = true) {
    const row = new GridRow(name);
    await row.dropdown().click();
    const key = on ? 'activate' : 'deactivate';
    await row.menu.$(`[data-method="${key}"]`).click();
  }
}

module.exports = UserPage;
