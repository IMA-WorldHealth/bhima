const TU = require('../shared/TestUtils');
const { by } = require('../shared/TestUtils');

const GridRow = require('../shared/GridRow');
const { notification, accountSelect } = require('../shared/components');

class RubricPage {

  async create(rubric) {
    await TU.buttons.create();
    await TU.input('RubricModalCtrl.rubric.label', rubric.label);
    await TU.input('RubricModalCtrl.rubric.abbr', rubric.abbr);

    await accountSelect.set(rubric.debtor_account_id, 'debtor_account_id');
    await accountSelect.set(rubric.expense_account_id, 'expense_account_id');

    await TU.input('RubricModalCtrl.rubric.value', rubric.value);

    if (rubric.is_percent) {
      await TU.locator('[name="is_percent"]').click();
    }

    const isDiscount = (rubric.is_discount === 1) ? 'discount' : 'addition';
    await TU.locator(by.id(isDiscount)).click();

    const isMembershipFee = (rubric.is_membership_fee === 1) ? 'is_membership_fee_yes' : 'is_membership_fee_no';
    await TU.locator(by.id(isMembershipFee)).click();

    const isTax = (rubric.is_tax === 1) ? 'is_tax_yes' : 'is_tax_no';
    await TU.locator(by.id(isTax)).click();

    const isEmployee = (rubric.is_employee === 1) ? 'is_employee_yes' : 'is_employee_no';
    await TU.locator(by.id(isEmployee)).click();

    await TU.modal.submit();
    await notification.hasSuccess();
  }

  async errorOnCreateRubric() {
    await TU.buttons.create();
    await TU.buttons.submit();
    await TU.validation.error('RubricModalCtrl.rubric.label');
    await TU.buttons.cancel();
  }

  async update(label, updateRubric) {
    const row = new GridRow(label);
    await row.dropdown();
    await row.edit();
    await TU.input('RubricModalCtrl.rubric.label', updateRubric.label);

    await TU.modal.submit();
    await notification.hasSuccess();
  }

  async remove(label) {
    const row = new GridRow(label);
    await row.dropdown();
    await row.remove();
    await TU.modal.submit();
    await notification.hasSuccess();
  }

  async importIndexesRubric() {
    await TU.locator('[data-action="open-tools"]').click();
    await TU.locator('[data-method="import-indexes-rubrics"]').click();
    await TU.modal.submit();
    await notification.hasSuccess();
  }

}

module.exports = RubricPage;
