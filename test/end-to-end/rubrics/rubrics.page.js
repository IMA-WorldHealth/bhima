/* global element, by */

/**
 * This class is represents a rubric page in term of structure and
 * behaviour so it is a rubric page object
 */

const chai = require('chai');
const helpers = require('../shared/helpers');

helpers.configure(chai);

/* loading grid actions */
const GA = require('../shared/GridAction');
const GU = require('../shared/GridUtils');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');

class RubricPage {
  constructor() {
    this.gridId = 'rubric-grid';
    this.rubricGrid = element(by.id(this.gridId));
    this.actionLinkColumn = 14;
  }

  /**
   * send back the number of rubrics in the grid
   */
  getRubricCount() {
    return this.rubricGrid
      .element(by.css('.ui-grid-render-container-body'))
      .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'))
      .count();
  }

  /**
   * simulate the create rubric button click to show the dialog of creation
   */
  createRubric(rubric) {
    FU.buttons.create();
    FU.input('RubricModalCtrl.rubric.label', rubric.label);
    FU.input('RubricModalCtrl.rubric.abbr', rubric.abbr);

    components.accountSelect.set(rubric.debtor_account_id, 'debtor_account_id');
    components.accountSelect.set(rubric.expense_account_id, 'expense_account_id');

    FU.input('RubricModalCtrl.rubric.value', rubric.value);

    if (rubric.is_percent) {
      element(by.css('[name="is_percent"]')).click();
    }

    const isDiscount = (rubric.is_discount === 1) ? 'discount' : 'addition';
    element(by.id(isDiscount)).click();

    const isMembershipFee = (rubric.is_membership_fee === 1) ? 'is_membership_fee_yes' : 'is_membership_fee_no';
    element(by.id(isMembershipFee)).click();

    const isTax = (rubric.is_tax === 1) ? 'is_tax_yes' : 'is_tax_no';
    element(by.id(isTax)).click();

    const isEmployee = (rubric.is_employee === 1) ? 'is_employee_yes' : 'is_employee_no';
    element(by.id(isEmployee)).click();

    FU.buttons.submit();
    components.notification.hasSuccess();
  }

  /**
   * block creation without the function name
   */
  errorOnCreateRubric() {
    FU.buttons.create();
    FU.buttons.submit();
    FU.validation.error('RubricModalCtrl.rubric.label');
    FU.buttons.cancel();
  }

  /**
   * simulate a click on the edit link of a function
   */
  editRubric(label, updateRubric) {
    GU.getGridIndexesMatchingText(this.gridId, label)
      .then(indices => {
        const { rowIndex } = indices;
        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'edit', this.gridId);
        FU.input('RubricModalCtrl.rubric.label', updateRubric.label);

        FU.buttons.submit();
        components.notification.hasSuccess();
      });
  }

  /**
   * simulate a click on the delete link of a function
   */
  deleteRubric(label) {
    GU.getGridIndexesMatchingText(this.gridId, label)
      .then(indices => {
        const { rowIndex } = indices;
        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'delete', this.gridId);
        components.modalAction.confirm();
        components.notification.hasSuccess();
      });
  }
}

module.exports = RubricPage;
