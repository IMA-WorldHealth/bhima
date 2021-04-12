/* global element, by */

const GridRow = require('../shared/GridRow');
const FU = require('../shared/FormUtils');
const { notification, accountSelect } = require('../shared/components');

class RubricPage {

  async create(rubric) {
    await FU.buttons.create();
    await FU.input('RubricModalCtrl.rubric.label', rubric.label);
    await FU.input('RubricModalCtrl.rubric.abbr', rubric.abbr);

    await accountSelect.set(rubric.debtor_account_id, 'debtor_account_id');
    await accountSelect.set(rubric.expense_account_id, 'expense_account_id');

    await FU.input('RubricModalCtrl.rubric.value', rubric.value);

    if (rubric.is_percent) {
      await element(by.css('[name="is_percent"]')).click();
    }

    const isDiscount = (rubric.is_discount === 1) ? 'discount' : 'addition';
    await element(by.id(isDiscount)).click();

    const isMembershipFee = (rubric.is_membership_fee === 1) ? 'is_membership_fee_yes' : 'is_membership_fee_no';
    await element(by.id(isMembershipFee)).click();

    const isTax = (rubric.is_tax === 1) ? 'is_tax_yes' : 'is_tax_no';
    await element(by.id(isTax)).click();

    const isEmployee = (rubric.is_employee === 1) ? 'is_employee_yes' : 'is_employee_no';
    await element(by.id(isEmployee)).click();

    await FU.modal.submit();
    await notification.hasSuccess();
  }

  async errorOnCreateRubric() {
    await FU.buttons.create();
    await FU.buttons.submit();
    await FU.validation.error('RubricModalCtrl.rubric.label');
    await FU.buttons.cancel();
  }

  async update(label, updateRubric) {
    const row = new GridRow(label);
    await row.dropdown().click();
    await row.edit().click();
    await FU.input('RubricModalCtrl.rubric.label', updateRubric.label);

    await FU.modal.submit();
    await notification.hasSuccess();
  }

  async remove(label) {
    const row = new GridRow(label);
    await row.dropdown().click();
    await row.remove().click();
    await FU.modal.submit();
    await notification.hasSuccess();
  }

  async importIndexesRubric() {
    await element(by.css('[data-action="open-tools"]')).click();
    await element(by.css('[data-method="import-indexes-rubrics"]')).click();
    await FU.modal.submit();
    await notification.hasSuccess();
  }

}

module.exports = RubricPage;
