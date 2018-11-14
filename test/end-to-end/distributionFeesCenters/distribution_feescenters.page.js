/* global element, by */

/**
 * This class is represents a Fees Centers Distributions page in term of structure and
 * behaviour so it is a Distribution page object
 */

const chai = require('chai');
const helpers = require('../shared/helpers');

helpers.configure(chai);

/* loading grid actions */
const GA = require('../shared/GridAction');
const GU = require('../shared/GridUtils');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');

const gridId = 'distribution-center-grid';

class DistributionPage {
  constructor() {
    this.gridId = 'distribution-center-grid';
    this.rubricGrid = element(by.id(this.gridId));
    this.actionLinkColumn = 9;
    this.actionLinkUpdateColumn = 10;
  }

  setDistributionPercentage(dataset) {
    components.fiscalPeriodSelect.set(dataset.fiscal_id, dataset.periodFrom_id, dataset.periodTo_id);

    if (dataset.profitCenter) {
      element(by.id('is_profit')).click();
    }

    FU.buttons.submit();
    GU.selectRow(gridId, 0);
    element(by.css('[data-action="open-menu"]')).click();
    element(by.css('[data-method="breackdown-percentages"]')).click();

    // Prevent initialization of distribution keys greater than 100 percent
    components.percentageInput.set(40, 'principal_1');
    components.percentageInput.set(100, 'principal_2');
    components.percentageInput.set(13, 'principal_3');

    FU.buttons.submit();
    FU.exists(by.id('validation-error'), true);

    // Prevent initialization of distribution keys less than 100 percent
    components.percentageInput.set(1, 'principal_1');
    components.percentageInput.set(2, 'principal_2');
    components.percentageInput.set(3, 'principal_3');

    FU.buttons.submit();
    FU.exists(by.id('validation-error'), true);

    components.percentageInput.set(50, 'principal_1');
    components.percentageInput.set(35, 'principal_2');
    components.percentageInput.set(15, 'principal_3');

    FU.buttons.submit();
    components.notification.hasSuccess();
  }

  setDistributionAutomatic() {
    GU.selectRow(gridId, 0);
    element(by.css('[data-action="open-menu"]')).click();
    element(by.css('[data-method="automatic-breackdown"]')).click();
    components.notification.hasSuccess();
  }

  setDistributionManual(dataset) {
    element(by.css('[data-method="setting"]')).click();
    components.fiscalPeriodSelect.set(dataset.fiscal_id, dataset.periodFrom_id, dataset.periodTo_id);

    if (!dataset.profitCenter) {
      element(by.id('is_cost')).click();
    }

    FU.buttons.submit();

    GU.getGridIndexesMatchingText(this.gridId, dataset.label)
      .then(indices => {
        const { rowIndex } = indices;

        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'distribution', this.gridId);
        components.currencyInput.set(1000, 'principal_1');
        components.currencyInput.set(145, 'principal_2');
        components.currencyInput.set(76, 'principal_3');

        FU.buttons.submit();
        FU.exists(by.id('validation-error'), true);

        components.percentageInput.set(1, 'principal_1');
        components.percentageInput.set(2, 'principal_2');
        components.percentageInput.set(3, 'principal_3');

        FU.buttons.submit();
        FU.exists(by.id('validation-error'), true);

        components.percentageInput.set(100.62, 'principal_1');
        components.percentageInput.set(78, 'principal_2');
        components.percentageInput.set(78, 'principal_3');

        FU.buttons.submit();
        components.notification.hasSuccess();
      });
  }

  setUpdatedDistribution(dataset) {
    components.fiscalPeriodSelect.set(dataset.fiscal_id, dataset.periodFrom_id, dataset.periodTo_id);

    if (dataset.costCenter) {
      element(by.id('is_cost')).click();
    }
    FU.buttons.submit();

    GU.getGridIndexesMatchingText(this.gridId, dataset.uuid)
      .then(indices => {
        const { rowIndex } = indices;

        GA.clickOnMethod(rowIndex, this.actionLinkUpdateColumn, 'edit', this.gridId);
        components.currencyInput.set(1000, 'principal_1');
        components.currencyInput.set(100, 'principal_2');
        components.currencyInput.set(500, 'principal_3');

        FU.buttons.submit();
        FU.exists(by.id('validation-error'), true);

        components.percentageInput.set(1, 'principal_1');
        components.percentageInput.set(2, 'principal_2');
        components.percentageInput.set(3, 'principal_3');

        FU.buttons.submit();
        FU.exists(by.id('validation-error'), true);

        components.percentageInput.set(92, 'principal_1');
        components.percentageInput.set(88.6, 'principal_2');
        components.percentageInput.set(76.02, 'principal_3');

        FU.buttons.submit();
        components.notification.hasSuccess();
      });
  }
}

module.exports = DistributionPage;
