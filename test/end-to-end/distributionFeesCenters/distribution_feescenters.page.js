/* eslint  */
/* global element, by */

/**
 * This class is represents a Fees Centers Distributions page in term of structure and
 * behaviour so it is a Distribution page object
 */

const GU = require('../shared/GridUtils');
const FU = require('../shared/FormUtils');
const GridRow = require('../shared/GridRow');
const components = require('../shared/components');

const gridId = 'distribution-center-grid';

class DistributionPage {
  constructor() {
    this.gridId = 'distribution-center-grid';
    this.rubricGrid = element(by.id(this.gridId));
    this.actionLinkColumn = 9;
    this.actionLinkUpdateColumn = 10;
  }

  async setDistributionPercentage(dataset) {
    await components.fiscalPeriodSelect.set(dataset.fiscal_id, dataset.periodFrom_id, dataset.periodTo_id);

    if (dataset.profitCenter) {
      await element(by.id('is_profit')).click();
    }

    await FU.buttons.submit();
    await GU.selectRow(gridId, 0);
    await element(by.css('[data-action="open-menu"]')).click();
    await element(by.css('[data-method="breakdown-percentages"]')).click();

    // Prevent initialization of distribution keys greater than 100 percent
    await components.percentageInput.set(40, 'principal_1');
    await components.percentageInput.set(100, 'principal_2');
    await components.percentageInput.set(13, 'principal_3');

    await FU.buttons.submit();
    await FU.exists(by.id('validation-error'), true);

    // Prevent initialization of distribution keys less than 100 percent
    await components.percentageInput.set(1, 'principal_1');
    await components.percentageInput.set(2, 'principal_2');
    await components.percentageInput.set(3, 'principal_3');

    await FU.buttons.submit();
    await FU.exists(by.id('validation-error'), true);

    await components.percentageInput.set(50, 'principal_1');
    await components.percentageInput.set(35, 'principal_2');
    await components.percentageInput.set(15, 'principal_3');

    await FU.buttons.submit();
    await components.notification.hasSuccess();
  }

  async setDistributionAutomatic() {
    await GU.selectRow(gridId, 0);
    await element(by.css('[data-action="open-menu"]')).click();
    await element(by.css('[data-method="automatic-breakdown"]')).click();
    await components.notification.hasSuccess();
  }

  async setDistributionManual(dataset) {
    await element(by.css('[data-method="setting"]')).click();
    await components.fiscalPeriodSelect.set(dataset.fiscal_id, dataset.periodFrom_id, dataset.periodTo_id);

    if (!dataset.profitCenter) {
      await element(by.id('is_cost')).click();
    }

    await FU.buttons.submit();

    // get the grid row
    const row = new GridRow(dataset.trans_id);
    await row.dropdown().click();
    await row.method('distribution').click();

    await components.currencyInput.set(1000, 'principal_1');
    await components.currencyInput.set(145, 'principal_2');
    await components.currencyInput.set(76, 'principal_3');

    await FU.buttons.submit();
    await FU.exists(by.id('validation-error'), true);

    await components.percentageInput.set(1, 'principal_1');
    await components.percentageInput.set(2, 'principal_2');
    await components.percentageInput.set(3, 'principal_3');

    await FU.buttons.submit();
    await FU.exists(by.id('validation-error'), true);

    await components.percentageInput.set(100.62, 'principal_1');
    await components.percentageInput.set(78, 'principal_2');
    await components.percentageInput.set(78, 'principal_3');

    await FU.buttons.submit();
    await components.notification.hasSuccess();
  }

  async setUpdatedDistribution(dataset) {
    await components.fiscalPeriodSelect.set(dataset.fiscal_id, dataset.periodFrom_id, dataset.periodTo_id);

    if (dataset.costCenter) {
      await element(by.id('is_cost')).click();
    }

    await FU.buttons.submit();

    const row = new GridRow(dataset.trans_id);
    await row.dropdown().click();
    await row.edit().click();

    await components.currencyInput.set(1000, 'principal_1');
    await components.currencyInput.set(100, 'principal_2');
    await components.currencyInput.set(500, 'principal_3');

    await FU.buttons.submit();
    await FU.exists(by.id('validation-error'), true);

    await components.percentageInput.set(1, 'principal_1');
    await components.percentageInput.set(2, 'principal_2');
    await components.percentageInput.set(3, 'principal_3');

    await FU.buttons.submit();
    await FU.exists(by.id('validation-error'), true);

    await components.percentageInput.set(92, 'principal_1');
    await components.percentageInput.set(88.6, 'principal_2');
    await components.percentageInput.set(76.02, 'principal_3');

    await FU.buttons.submit();
    await components.notification.hasSuccess();
  }
}

module.exports = DistributionPage;
