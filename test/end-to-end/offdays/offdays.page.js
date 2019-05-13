/* global element, by */
/* eslint  */

/**
 * This class is represents a offday page in term of structure and
 * behaviour so it is a offday page object
 */

/* loading grid actions */
const GU = require('../shared/GridUtils');
const GA = require('../shared/GridAction');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');

class OffdayPage {
  constructor() {
    this.gridId = 'offday-grid';
    this.offdayGrid = element(by.id(this.gridId));
    this.actionLinkColumn = 3;
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

  /**
   * simulate a click on the edit link of a function
   */
  async editOffday(label, updateOffday) {
    const { rowIndex } = await GU.getGridIndexesMatchingText(this.gridId, label);
    await GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'edit', this.gridId);
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
    const { rowIndex } = await GU.getGridIndexesMatchingText(this.gridId, label);
    await GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'delete', this.gridId);
    await components.modalAction.confirm();
    await components.notification.hasSuccess();
  }
}

module.exports = OffdayPage;
