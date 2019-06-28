/* global element, by, browser */

const EC = require('protractor').ExpectedConditions;
const GridRow = require('../shared/GridRow');
const FU = require('../shared/FormUtils');
const { notification } = require('../shared/components');

class RubricConfigPage {
  constructor() {
    this.gridId = 'rubric-grid';
  }

  count() {
    return element(by.id(this.gridId))
      .element(by.css('.ui-grid-render-container-body'))
      .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'))
      .count();
  }

  async create(rubric) {
    await FU.buttons.create();
    await FU.input('ConfigModalCtrl.rubric.label', rubric.label);

    await FU.modal.submit();
    await notification.hasSuccess();
  }

  async errorOnCreateRubricConfig() {
    await FU.buttons.create();
    await FU.modal.submit();
    await FU.validation.error('ConfigModalCtrl.rubric.label');
    await FU.modal.cancel();
  }

  async update(label, updateRubricConfig) {
    const row = new GridRow(label);
    await row.dropdown().click();
    await row.edit().click();

    await FU.input('ConfigModalCtrl.rubric.label', updateRubricConfig.label);

    await FU.modal.submit();
    await notification.hasSuccess();
  }

  async setRubricConfig(label) {
    const row = new GridRow(label);
    await row.dropdown().click();
    await row.method('configure').click();

    await browser.wait(EC.elementToBeClickable(element(by.id('social'))), 1500);

    await element(by.id('social')).click();
    await element(by.id('tax')).click();

    await FU.modal.submit();
    await notification.hasSuccess();
  }

  async unsetRubricConfig(label) {
    const row = new GridRow(label);
    await row.dropdown().click();
    await row.method('configure').click();

    const checkbox = element(by.id('all'));
    await browser.wait(EC.elementToBeClickable(checkbox), 1500);

    // double click to set all, then unset
    await checkbox.click();
    await checkbox.click();

    await FU.modal.submit();
    await notification.hasSuccess();
  }

  async remove(label) {
    const row = new GridRow(label);
    await row.dropdown().click();
    await row.remove().click();
    await FU.modal.submit();
    await notification.hasSuccess();
  }
}

module.exports = RubricConfigPage;
