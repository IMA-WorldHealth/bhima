const TU = require('../shared/TestUtils');
const { by } = require('../shared/TestUtils');

const GU = require('../shared/GridUtils');
const GridRow = require('../shared/GridRow');
const components = require('../shared/components');

/**
 * This class is represents a Fees Centers Distributions page in term of structure and
 * behaviour so it is a Distribution page object
 */
class CostCentersPage {

  constructor() {
    this.gridId = 'cost-centers-grid';
    this.actionLinkColumn = 9;
    this.actionLinkUpdateColumn = 10;
  }

  async setDistributionPercentage(dataset) {
    await components.fiscalPeriodSelect.set(dataset.fiscal_id, dataset.periodFrom_id, dataset.periodTo_id);

    if (dataset.profitCenter) {
      await TU.locator(by.id('is_profit')).click();
    }

    await TU.buttons.submit();
    await GU.selectRow(this.gridId, 0);
    await TU.locator('[data-action="open-menu"]').click();
    await TU.locator('[data-method="breakdown-percentages"]').click();

    // Prevent initialization of allocation keys greater than 100 percent
    await components.percentageInput.set(40, 'principal_1');
    await components.percentageInput.set(100, 'principal_2');
    await components.percentageInput.set(13, 'principal_3');

    await TU.buttons.submit();
    await TU.exists(by.id('validation-error'), true);

    // Prevent initialization of allocation keys less than 100 percent
    await components.percentageInput.set(1, 'principal_1');
    await components.percentageInput.set(2, 'principal_2');
    await components.percentageInput.set(3, 'principal_3');

    await TU.buttons.submit();
    await TU.exists(by.id('validation-error'), true);

    await components.percentageInput.set(50, 'principal_1');
    await components.percentageInput.set(35, 'principal_2');
    await components.percentageInput.set(15, 'principal_3');

    await TU.buttons.submit();
    await components.notification.hasSuccess();
  }

  async setDistributionAutomatic() {
    await GU.selectRow(this.gridId, 0);
    await TU.locator('[data-action="open-menu"]').click();
    await TU.locator('[data-method="automatic-breakdown"]').click();
    await components.notification.hasSuccess();
  }

  async setDistributionManual(dataset) {
    await TU.locator('[data-method="setting"]').click();
    await components.fiscalPeriodSelect.set(dataset.fiscal_id, dataset.periodFrom_id, dataset.periodTo_id);

    if (!dataset.profitCenter) {
      await TU.locator(by.id('is_cost')).click();
    }

    await TU.buttons.submit();

    // get the grid row
    const row = new GridRow(dataset.trans_id);
    await row.dropdown();
    await row.method('allocation');

    await components.currencyInput.set(1000, 'principal_1');
    await components.currencyInput.set(145, 'principal_2');
    await components.currencyInput.set(76, 'principal_3');

    await TU.buttons.submit();
    await TU.exists(by.id('validation-error'), true);

    await components.percentageInput.set(1, 'principal_1');
    await components.percentageInput.set(2, 'principal_2');
    await components.percentageInput.set(3, 'principal_3');

    await TU.buttons.submit();
    await TU.exists(by.id('validation-error'), true);

    await components.percentageInput.set(100.62, 'principal_1');
    await components.percentageInput.set(78, 'principal_2');
    await components.percentageInput.set(78, 'principal_3');

    await TU.buttons.submit();
    await components.notification.hasSuccess();
  }

  async setUpdatedDistribution(dataset) {
    await components.fiscalPeriodSelect.set(dataset.fiscal_id, dataset.periodFrom_id, dataset.periodTo_id);

    if (dataset.costCenter) {
      await TU.locator(by.id('is_cost')).click();
    }

    await TU.buttons.submit();

    const row = new GridRow(dataset.trans_id);
    await row.dropdown();
    await row.edit();

    await components.currencyInput.set(1000, 'principal_1');
    await components.currencyInput.set(100, 'principal_2');
    await components.currencyInput.set(500, 'principal_3');

    await TU.buttons.submit();
    await TU.exists(by.id('validation-error'), true);

    await components.percentageInput.set(1, 'principal_1');
    await components.percentageInput.set(2, 'principal_2');
    await components.percentageInput.set(3, 'principal_3');

    await TU.buttons.submit();
    await TU.exists(by.id('validation-error'), true);

    await components.percentageInput.set(92, 'principal_1');
    await components.percentageInput.set(88.6, 'principal_2');
    await components.percentageInput.set(76.02, 'principal_3');

    await TU.buttons.submit();
    await components.notification.hasSuccess();
  }
}

module.exports = CostCentersPage;
