/* global element, by */

/**
 * This class is represents a Fee Center Distribution Keys Management page in term of structure and
 * behaviour so it is a Fee Center page object
 */

const FU = require('../shared/FormUtils');
const GridRow = require('../shared/GridRow');
const components = require('../shared/components');

class FeeCenterPage {
  constructor() {
    this.gridId = 'distribution-key-center-grid';
    this.distributionGrid = element(by.id(this.gridId));
  }

  /**
   * The numbers of transactions related to auxiliary centers to be returned to the main expense centers
   */
  getDistributionKeyCount() {
    return this.distributionGrid
      .element(by.css('.ui-grid-render-container-body'))
      .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'))
      .count();
  }

  async openDropdownSettingsMenu(label) {
    const row = new GridRow(label);
    await row.dropdown().click();
    await row.method('setting').click();
  }

  async setDistributionKey(label) {
    await this.openDropdownSettingsMenu(label);

    await components.percentageInput.set(50, 'principal_1');
    await components.percentageInput.set(25, 'principal_2');
    await components.percentageInput.set(25, 'principal_3');

    await FU.buttons.submit();
    await components.notification.hasSuccess();
  }

  // Reset Distribution Keys for an auxiliary fee center
  async resetDistributionKey(label) {
    await this.openDropdownSettingsMenu(label);
    await $('[data-method="reset"]').click();
    await components.notification.hasSuccess();
  }

  // Prevent initialization of distribution keys greater than 100 percent
  // Prevent initialization of distribution keys less than 100 percent
  async preventGreaterLess100(label) {
    await this.openDropdownSettingsMenu(label);
    await components.percentageInput.set(19, 'principal_1');
    await components.percentageInput.set(45, 'principal_2');
    await components.percentageInput.set(76, 'principal_3');

    await FU.buttons.submit();
    await FU.exists(by.id('validation-error'), true);

    await components.percentageInput.set(1, 'principal_1');
    await components.percentageInput.set(2, 'principal_2');
    await components.percentageInput.set(3, 'principal_3');

    await FU.buttons.submit();
    await FU.exists(by.id('validation-error'), true);

    await components.percentageInput.set(33.3, 'principal_1');
    await components.percentageInput.set(33.3, 'principal_2');
    await components.percentageInput.set(33.4, 'principal_3');

    await FU.buttons.submit();
    await components.notification.hasSuccess();
  }
}

module.exports = FeeCenterPage;
