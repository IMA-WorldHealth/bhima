/* global element, by */
/* eslint class-methods-use-this: off */

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

  update(name) {
    const row = new GridRow(name);
    row.dropdown().click();
    row.edit().click();
  }


  updateDepot(name) {
    const row = new GridRow(name);
    row.dropdown().click();
    row.menu.$('[data-method="depot"]').click();
  }

  updateCashbox(name) {
    const row = new GridRow(name);
    row.dropdown().click();
    row.menu.$('[data-method="cashbox"]').click();
  }

  toggleUser(name, on = true) {
    const row = new GridRow(name);
    row.dropdown().click();
    const key = on ? 'activate' : 'deactivate';
    row.menu.$(`[data-method="${key}"]`).click();
  }
}

module.exports = UserPage;
