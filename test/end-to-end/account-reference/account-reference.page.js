/* global element, by */
/* eslint  */

/**
 * This class is represents an accountReference page in term of structure and
 * behaviour so it is a accountReference page object
 */

const GridRow = require('../shared/GridRow');

class AccountReferencePage {
  constructor() {
    this.grid = element(by.id('account-reference-grid'));
    this.createBtn = element(by.css('[data-method="create"]'));
    this.searchBtn = element(by.css('[data-method="search"]'));
  }

  count() {
    return this.grid
      .$('.ui-grid-render-container-body')
      .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'))
      .count();
  }

  create() {
    return this.createBtn.click();
  }

  search() {
    return this.searchBtn.click();
  }

  async update(reference) {
    const row = new GridRow(reference);
    await row.dropdown().click();
    await row.edit().click();
  }

  async remove(reference) {
    const row = new GridRow(reference);
    await row.dropdown().click();
    await row.remove().click();
  }
}

module.exports = AccountReferencePage;
