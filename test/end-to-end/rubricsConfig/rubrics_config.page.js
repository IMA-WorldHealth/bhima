/* global element, by, browser */
/* eslint class-methods-use-this:off */

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

  create(rubric) {
    FU.buttons.create();
    FU.input('ConfigModalCtrl.rubric.label', rubric.label);

    FU.modal.submit();
    notification.hasSuccess();
  }

  errorOnCreateRubricConfig() {
    FU.buttons.create();
    FU.modal.submit();
    FU.validation.error('ConfigModalCtrl.rubric.label');
    FU.modal.cancel();
  }

  update(label, updateRubricConfig) {
    const row = new GridRow(label);
    row.dropdown().click();
    row.edit().click();

    FU.input('ConfigModalCtrl.rubric.label', updateRubricConfig.label);

    FU.modal.submit();
    notification.hasSuccess();
  }

  setRubricConfig(label) {
    const row = new GridRow(label);
    row.dropdown().click();
    row.method('configure').click();

    element(by.id('social')).click();
    element(by.id('tax')).click();

    FU.modal.submit();
    notification.hasSuccess();
  }

  unsetRubricConfig(label) {
    const row = new GridRow(label);
    row.dropdown().click();
    row.method('conigure').click();

    const checkbox = element(by.id('all'));
    browser.wait(EC.elementToBeClickable(checkbox), 1500);

    // double click to set all, then unset
    checkbox.click();
    checkbox.click();

    FU.modal.submit();
    notification.hasSuccess();
  }

  remove(label) {
    const row = new GridRow(label);
    row.dropdown().click();
    row.remove().click();
    FU.modal.submit();
    notification.hasSuccess();
  }
}

module.exports = RubricConfigPage;
