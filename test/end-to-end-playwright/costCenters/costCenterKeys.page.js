const TU = require('../shared/TestUtils');
const { by } = require('../shared/TestUtils');

const GridRow = require('../shared/GridRow');
const components = require('../shared/components');

/**
 * This class is represents a Cost Center Distribution Keys Management page in term of structure and
 * behaviour so it is a Cost Center page object
 */

class CostCentersKeysPage {
  constructor() {
    this.gridId = 'cost-center-key-grid';
  }

  /**
   * The numbers of transactions related to auxiliary centers to be returned to the main expense centers
   */
  async getDistributionKeyCount() {
    await TU.waitForSelector('.ui-grid-canvas .ui-grid-row');
    const allocationGrid = await TU.locator(by.id(this.gridId));
    return allocationGrid
      .locator('.ui-grid-render-container-body')
      .locator(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'))
      .count();
  }

  async edit(label) {
    const row = new GridRow(label);
    await row.dropdown();
    return row.edit();
  }

  async setDistributionKey(label) {
    await this.edit(label);

    await components.percentageInput.set(50, 'principal_1');
    await components.percentageInput.set(25, 'principal_2');
    await components.percentageInput.set(25, 'principal_3');

    await TU.buttons.submit();
    await components.notification.hasSuccess();
  }

  // Reset Distribution Keys for an auxiliary cost center
  async resetDistributionKey(label) {
    await this.edit(label);
    await TU.locator('[data-method="reset"]').click();
    await components.notification.hasSuccess();
  }

  // Prevent initialization of allocation keys greater than 100 percent
  // Prevent initialization of allocation keys less than 100 percent
  async preventGreaterLess100(label) {
    await this.edit(label);
    await components.percentageInput.set(19, 'principal_1');
    await components.percentageInput.set(45, 'principal_2');
    await components.percentageInput.set(76, 'principal_3');

    await TU.buttons.submit();
    await TU.exists(by.id('validation-error'), true);

    await components.percentageInput.set(1, 'principal_1');
    await components.percentageInput.set(2, 'principal_2');
    await components.percentageInput.set(3, 'principal_3');

    await TU.buttons.submit();
    await TU.exists(by.id('validation-error'), true);

    await components.percentageInput.set(33.3, 'principal_1');
    await components.percentageInput.set(33.3, 'principal_2');
    await components.percentageInput.set(33.4, 'principal_3');

    await TU.buttons.submit();
    await components.notification.hasSuccess();
  }
}

module.exports = CostCentersKeysPage;
