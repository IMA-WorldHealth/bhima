/* global element, by */
/* eslint class-methods-use-this:off */

const GridRow = require('../shared/GridRow');
const FU = require('../shared/FormUtils');
const { notification, accountSelect } = require('../shared/components');

class RubricPage {
  constructor() {
    this.gridId = 'rubric-grid';
  }

  count() {
    return element(by.id(this.gridId))
      .element(by.css('.ui-grid-render-container-body'))
      .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'))
      .count();
  }

  create(rubric) {
    FU.buttons.create();
    FU.input('RubricModalCtrl.rubric.label', rubric.label);
    FU.input('RubricModalCtrl.rubric.abbr', rubric.abbr);

    accountSelect.set(rubric.debtor_account_id, 'debtor_account_id');
    accountSelect.set(rubric.expense_account_id, 'expense_account_id');

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

    FU.modal.submit();
    notification.hasSuccess();
  }

  errorOnCreateRubric() {
    FU.buttons.create();
    FU.buttons.submit();
    FU.validation.error('RubricModalCtrl.rubric.label');
    FU.buttons.cancel();
  }

  update(label, updateRubric) {
    const row = new GridRow(label);
    row.dropdown().click();
    row.edit().click();
    FU.input('RubricModalCtrl.rubric.label', updateRubric.label);

    FU.modal.submit();
    notification.hasSuccess();
  }

  remove(label) {
    const row = new GridRow(label);
    row.dropdown().click();
    row.remove().click();
    FU.modal.submit();
    notification.hasSuccess();
  }
}

module.exports = RubricPage;
