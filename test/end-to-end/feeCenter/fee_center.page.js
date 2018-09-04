/* global element, by */

/**
 * This class is represents a Fee Center page in term of structure and
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
    this.gridId = 'fee-center-grid';
    this.rubricGrid = element(by.id(this.gridId));
    this.actionLinkColumn = 2;
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
  createFeeCenter(feeCenter) {
    FU.buttons.create();
    FU.input('FeeCenterModalCtrl.feeCenter.label', feeCenter.label);

    const isPrincipal = (feeCenter.is_principal) ? 'principal' : 'auxiliary';
    element(by.id(isPrincipal)).click();

    if (feeCenter.has_profit_center) {
      element(by.id('has_profit_center')).click();
    }
    components.accountReferenceSelect.set(feeCenter.reference_profit_id, 'account_profit_reference_id');

    if (feeCenter.has_cost_center) {
      element(by.id('has_cost_center')).click();
    }
    components.accountReferenceSelect.set(feeCenter.reference_cost_id, 'account_cost_reference_id');

    FU.buttons.submit();
    components.notification.hasSuccess();
  }

  /**
   * simulate the unableing to assign to another expense center a reference already used in another expense center when creating
   */
  errorCreateFeeCenter(feeCenter) {
    FU.buttons.create();
    FU.input('FeeCenterModalCtrl.feeCenter.label', feeCenter.label);

    const isPrincipal = (feeCenter.is_principal) ? 'principal' : 'auxiliary';
    element(by.id(isPrincipal)).click();

    if (feeCenter.has_profit_center) {
      element(by.id('has_profit_center')).click();
    }
    components.accountReferenceSelect.set(feeCenter.reference_profit_id, 'account_profit_reference_id');

    if (feeCenter.has_cost_center) {
      element(by.id('has_cost_center')).click();
    }
    components.accountReferenceSelect.set(feeCenter.reference_cost_id, 'account_cost_reference_id');

    FU.buttons.submit();
    FU.buttons.cancel();
    components.notification.hasError();
  }

  /**
   * block creation without the function name
   */
  errorOnCreateFeeCenter(feeCenter) {
    FU.buttons.create();
    FU.buttons.submit();
    FU.validation.error('FeeCenterModalCtrl.feeCenter.label');
    FU.buttons.cancel();
  }

  /**
   * simulate a click on the edit link of a function
   */
  editFeeCenter(label, updateFeeCenter) {
    GU.getGridIndexesMatchingText(this.gridId, label)
      .then(indices => {
        const { rowIndex } = indices;
        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'edit', this.gridId);
        FU.input('FeeCenterModalCtrl.feeCenter.label', updateFeeCenter.label);

        if (updateFeeCenter.is_update_reference) {
          const isPrincipal = (updateFeeCenter.is_principal) ? 'principal' : 'auxiliary';
          element(by.id(isPrincipal)).click();

          const isCostProfit = (updateFeeCenter.is_profit) ? 'is_profit' : 'is_cost';
          element(by.id(isCostProfit)).click();

          if (updateFeeCenter.is_profit) {
            components.accountReferenceSelect.set(updateFeeCenter.reference_profit_id, 'account_profit_reference_id');  
          }
          
          if (!updateFeeCenter.is_profit) {
            components.accountReferenceSelect.set(updateFeeCenter.reference_cost_id, 'account_cost_reference_id');  
          } 
        }

        FU.buttons.submit();
        components.notification.hasSuccess();
      });
  }

  /**
   * simulate the unableing to assign to another expense center a reference already used in another expense center when Updating
   */
  errorEditFeeCenter(label, updateFeeCenter) {
    GU.getGridIndexesMatchingText(this.gridId, label)
      .then(indices => {
        const { rowIndex } = indices;
        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'edit', this.gridId);
        FU.input('FeeCenterModalCtrl.feeCenter.label', updateFeeCenter.label);

        if (updateFeeCenter.is_update_reference) {
          const isPrincipal = (updateFeeCenter.is_principal) ? 'principal' : 'auxiliary';
          element(by.id(isPrincipal)).click();

          const isCostProfit = (updateFeeCenter.is_profit) ? 'is_profit' : 'is_cost';
          element(by.id(isCostProfit)).click();

          if (updateFeeCenter.is_profit) {
            components.accountReferenceSelect.set(updateFeeCenter.reference_profit_id, 'account_profit_reference_id');  
          }
          
          if (!updateFeeCenter.is_profit) {
            components.accountReferenceSelect.set(updateFeeCenter.reference_cost_id, 'account_cost_reference_id');  
          } 
        }

        FU.buttons.submit();
        FU.buttons.cancel();
        components.notification.hasError();
      });
  }


  /**
   * simulate a click on the delete link of a function
   */
  deleteFeeCenter(label) {
    GU.getGridIndexesMatchingText(this.gridId, label)
      .then(indices => {
        const { rowIndex } = indices;
        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'delete', this.gridId);
        components.modalAction.confirm();
        components.notification.hasSuccess();
      });
  }
}

module.exports = FeeCenterPage;
