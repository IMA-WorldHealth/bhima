/* global element, by */
/* eslint  */

/**
 * This class is represents a Fee Center page in term of structure and
 * behaviour so it is a Fee Center page object
 */

const GA = require('../shared/GridAction');
const GU = require('../shared/GridUtils');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');

class FeeCenterPage {
  constructor() {
    this.gridId = 'fee-center-grid';
    this.rubricGrid = element(by.id(this.gridId));
    this.actionLinkColumn = 5;
  }

  /**
   * send back the number of Fees Centers in the grid
   */
  getFeeCenterCount() {
    return this.rubricGrid
      .element(by.css('.ui-grid-render-container-body'))
      .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'))
      .count();
  }

  /**
   * simulate the create Fee Center button click to show the dialog of creation
   */
  async createFeeCenter(feeCenter) {
    await FU.buttons.create();
    await FU.input('FeeCenterModalCtrl.feeCenter.label', feeCenter.label);

    const isPrincipal = (feeCenter.is_principal) ? 'principal' : 'auxiliary';
    await element(by.id(isPrincipal)).click();

    if (feeCenter.has_profit_center) {
      await element(by.id('has_profit_center')).click();
    }

    await components.accountReferenceSelect.set(feeCenter.reference_profit_id, 'account_profit_turnover_id');

    if (feeCenter.has_cost_center) {
      await element(by.id('has_cost_center')).click();
    }

    await components.accountReferenceSelect.set(feeCenter.reference_cost_id, 'account_cost_variable_reference_id');

    if (feeCenter.has_service) {
      await element(by.id('has_service')).click();
    }

    await components.servicesMultipleSelect.set(feeCenter.services, 'services');

    if (feeCenter.assigned_project) {
      await element(by.id('assigned_project')).click();
    }

    await components.projectSelect.set(feeCenter.project_id, 'project_id');

    await FU.buttons.submit();
    await components.notification.hasSuccess();
  }

  /**
   * simulate the unableing to assign to another expense center a reference already
   * used in another expense center when creating
   */
  async errorCreateFeeCenter(feeCenter) {
    await FU.buttons.create();
    await FU.input('FeeCenterModalCtrl.feeCenter.label', feeCenter.label);

    const isPrincipal = (feeCenter.is_principal) ? 'principal' : 'auxiliary';
    await element(by.id(isPrincipal)).click();

    if (feeCenter.has_profit_center) {
      await element(by.id('has_profit_center')).click();
    }

    await components.accountReferenceSelect.set(feeCenter.reference_profit_id, 'account_other_profit_reference_id');

    if (feeCenter.has_cost_center) {
      await element(by.id('has_cost_center')).click();
    }

    await components.accountReferenceSelect.set(feeCenter.reference_cost_id, 'account_cost_fixed_reference_id');

    // FIXME(@jniles) - why submit then cancel?  This doesn't make sense :/
    await FU.buttons.submit();
    await FU.buttons.cancel();
    await components.notification.hasError();
  }

  /**
   * block creation without the function name
   */
  async errorOnCreateFeeCenter() {
    await FU.buttons.create();
    await FU.buttons.submit();
    await FU.validation.error('FeeCenterModalCtrl.feeCenter.label');
    await FU.buttons.cancel();
  }

  /**
   * simulate a click on the edit link of a function
   */
  async editFeeCenter(label, updateFeeCenter) {
    const { rowIndex } = await GU.getGridIndexesMatchingText(this.gridId, label);
    await GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'edit', this.gridId);
    await FU.input('FeeCenterModalCtrl.feeCenter.label', updateFeeCenter.label);

    if (updateFeeCenter.is_update_reference) {
      const isPrincipal = (updateFeeCenter.is_principal) ? 'principal' : 'auxiliary';
      await element(by.id(isPrincipal)).click();

      const isCostProfit = (updateFeeCenter.is_profit) ? 'is_profit' : 'is_cost';
      await element(by.id(isCostProfit)).click();

      if (updateFeeCenter.is_profit) {
        await components.accountReferenceSelect.set(
          updateFeeCenter.reference_profit_id,
          'account_other_profit_reference_id'
        );
      } else {
        await components.accountReferenceSelect.set(
          updateFeeCenter.reference_cost_id,
          'account_cost_fixed_reference_id'
        );
      }
    }

    await FU.buttons.submit();
    await components.notification.hasSuccess();
  }

  /**
   * simulate the unableing to assign to another expense center a
   * reference already used in another expense center when Updating
   */
  async errorEditFeeCenter(label, updateFeeCenter) {
    const { rowIndex } = await GU.getGridIndexesMatchingText(this.gridId, label);
    await GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'edit', this.gridId);
    await FU.input('FeeCenterModalCtrl.feeCenter.label', updateFeeCenter.label);

    if (updateFeeCenter.is_update_reference) {
      const isPrincipal = (updateFeeCenter.is_principal) ? 'principal' : 'auxiliary';
      await element(by.id(isPrincipal)).click();

      const isCostProfit = (updateFeeCenter.is_profit) ? 'is_profit' : 'is_cost';
      await element(by.id(isCostProfit)).click();

      if (updateFeeCenter.is_profit) {
        await components.accountReferenceSelect.set(
          updateFeeCenter.reference_profit_id,
          'account_other_profit_reference_id'
        );
      } else {
        await components.accountReferenceSelect.set(
          updateFeeCenter.reference_cost_id,
          'account_cost_fixed_reference_id'
        );
      }
    }

    await FU.buttons.submit();
    await FU.buttons.cancel();
    await components.notification.hasError();
  }


  /**
   * simulate a click on the delete link of a function
   */
  async deleteFeeCenter(label) {
    const { rowIndex } = await GU.getGridIndexesMatchingText(this.gridId, label);
    await GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'delete', this.gridId);
    await components.modalAction.confirm();
    await components.notification.hasSuccess();
  }
}

module.exports = FeeCenterPage;
