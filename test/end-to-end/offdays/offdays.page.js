/* global element, by */

/**
 * This class is represents a offday page in term of structure and
 * behaviour so it is a offday page object
 */

/* loading grid actions */
const FU = require('../shared/FormUtils');
const GridRow = require('../shared/GridRow');
const components = require('../shared/components');

class OffdayPage {
  constructor() {
    this.offdayGrid = element(by.id('offday-grid'));
  }

  /**
   * send back the number of offdays in the grid
   */
  getOffdayCount() {
    return this.offdayGrid
      .element(by.css('.ui-grid-render-container-body'))
      .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'))
      .count();
  }

  /**
   * simulate the create offday button click to show the dialog of creation
   */
  async createOffday(offday) {
    await FU.buttons.create();
    await FU.input('OffdayModalCtrl.offday.label', offday.label);

    // FIX ME TO SET OFFDAY DATE WITH COMPONENTS DATE EDITOR
    // components.dateEditor.set(new Date(offday.date));

    await FU.input('OffdayModalCtrl.offday.percent_pay', offday.percent_pay);

    await FU.buttons.submit();
    await components.notification.hasSuccess();
  }

  /**
   * block creation without the function name
   */
  async errorOnCreateOffday() {
    await FU.buttons.create();
    await FU.buttons.submit();
    await FU.validation.error('OffdayModalCtrl.offday.label');
    await FU.buttons.cancel();
  }

  async openDropdownMenu(label) {
    const row = new GridRow(label);
    await row.dropdown().click();
    return row;
  }

  /**
   * simulate a click on the edit link of a function
   */
  async editOffday(label, updateOffday) {
    const row = await this.openDropdownMenu(label);
    await row.edit().click();

    await FU.input('OffdayModalCtrl.offday.label', updateOffday.label);

    // FIX ME TO SET OFFDAY DATE WITH COMPONENTS DATE EDITOR
    // components.dateEditor.set(new Date(updateOffday.date));

    await FU.input('OffdayModalCtrl.offday.percent_pay', updateOffday.percent_pay);

    await FU.buttons.submit();
    await components.notification.hasSuccess();
  }

  /**
   * simulate a click on the delete link of a function
   */
  async deleteOffday(label) {
    const row = await this.openDropdownMenu(label);
    await row.remove().click();

    await components.modalAction.confirm();
    await components.notification.hasSuccess();
  }
}

module.exports = OffdayPage;
