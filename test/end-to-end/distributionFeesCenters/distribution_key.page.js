/* eslint-disable lines-between-class-members */
/* global element, by */

/**
 * This class is represents a Fee Center Distribution Keys Management page in term of structure and
 * behaviour so it is a Fee Center page object
 */

const chai = require('chai');
const helpers = require('../shared/helpers');

helpers.configure(chai);

/* loading grid actions */
const GA = require('../shared/GridAction');
const GU = require('../shared/GridUtils');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');

class FeeCenterPage {
  constructor() {
    this.gridId = 'distribution-key-center-grid';
    this.rubricGrid = element(by.id(this.gridId));
    this.actionLinkColumn = 4;
  }

  /**
   * The numbers of transactions related to auxiliary centers to be returned to the main expense centers
   */
  getDistributionKeyCount() {
    return this.rubricGrid
      .element(by.css('.ui-grid-render-container-body'))
      .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'))
      .count();
  }

  setDistributionKey(label) {
    GU.getGridIndexesMatchingText(this.gridId, label)
      .then(indices => {
        const { rowIndex } = indices;

        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'setting', this.gridId);
        components.percentageInput.set(50, 'principal_1');
        components.percentageInput.set(25, 'principal_2');
        components.percentageInput.set(25, 'principal_3');
        FU.buttons.submit();
        components.notification.hasSuccess();
      });
  }
  // Reset Distribution Keys for an auxiliary fee center
  resetDistributionKey(label) {
    GU.getGridIndexesMatchingText(this.gridId, label)
      .then(indices => {
        const { rowIndex } = indices;
        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'setting', this.gridId);

        $('[data-method="reset"]').click();
        components.notification.hasSuccess();
      });
  }

  // Prevent initialization of distribution keys greater than 100 percent
  // Prevent initialization of distribution keys less than 100 percent
  preventGreaterLess100(label) {
    GU.getGridIndexesMatchingText(this.gridId, label)
      .then(indices => {
        const { rowIndex } = indices;

        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'setting', this.gridId);
        components.percentageInput.set(19, 'principal_1');
        components.percentageInput.set(45, 'principal_2');
        components.percentageInput.set(76, 'principal_3');

        FU.buttons.submit();
        FU.exists(by.id('validation-error'), true);

        components.percentageInput.set(1, 'principal_1');
        components.percentageInput.set(2, 'principal_2');
        components.percentageInput.set(3, 'principal_3');

        FU.buttons.submit();
        FU.exists(by.id('validation-error'), true);

        components.percentageInput.set(33.3, 'principal_1');
        components.percentageInput.set(33.3, 'principal_2');
        components.percentageInput.set(33.4, 'principal_3');

        FU.buttons.submit();
        components.notification.hasSuccess();
      });
  }
}

module.exports = FeeCenterPage;
