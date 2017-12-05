/* global element, by */

/**
 * This class is represents a offday page in term of structure and
 * behaviour so it is a offday page object
 */

const chai = require('chai');
const helpers = require('../shared/helpers');

helpers.configure(chai);

/* loading grid actions */
const GA = require('../shared/GridAction');
const GU = require('../shared/GridUtils');
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
  createOffday(offday) {
    FU.buttons.create();
    
    FU.input('OffdayModalCtrl.offday.label', offday.label);
    FU.input('OffdayModalCtrl.offday.percent_pay', offday.percent_pay);
    components.dateEditor.set(offday.date);

    FU.buttons.submit();
    components.notification.hasSuccess();
  }

  /**
   * block creation without the function name
   */
  errorOnCreateOffday() {
    FU.buttons.create();
    FU.buttons.submit();
    FU.validation.error('OffdayModalCtrl.offday.label');
    FU.buttons.cancel();
  }

  /**
   * simulate a click on the edit link of a function
   */
  editOffday(label, updateOffday) {
    GU.getGridIndexesMatchingText(this.gridId, label)
      .then(indices => {
        const { rowIndex } = indices;
        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'edit', this.gridId);
        FU.input('OffdayModalCtrl.offday.label', updateOffday.label);

        FU.buttons.submit();
        components.notification.hasSuccess();
      });
  }

  /**
   * simulate a click on the delete link of a function
   */
  deleteOffday(label) {
    GU.getGridIndexesMatchingText(this.gridId, label)
      .then(indices => {
        const { rowIndex } = indices;
        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'delete', this.gridId);
        components.modalAction.confirm();
        components.notification.hasSuccess();
      });
  }
}

module.exports = OffdayPage;