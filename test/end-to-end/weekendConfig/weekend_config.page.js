const GridRow = require('../shared/GridRow');
const FU = require('../shared/FormUtils');
const { notification } = require('../shared/components');

class WeekendConfigPage {

  async create(label) {
    await FU.buttons.create();
    await FU.input('WeekendModalCtrl.weekend.label', label);

    $('[data-label="FORM.LABELS.WEEK_DAYS.SUNDAY"]').click();
    $('[data-label="FORM.LABELS.WEEK_DAYS.MONDAY"]').click();
    $('[data-label="FORM.LABELS.WEEK_DAYS.SATURDAY"]').click();

    await FU.modal.submit();
    await notification.hasSuccess();
  }

  async errorOnCreateWeekendConfig() {
    await FU.buttons.create();
    await FU.buttons.submit();
    await FU.validation.error('WeekendModalCtrl.weekend.label');

    await FU.buttons.cancel();
  }

  async update(oldLabel, newLabel) {
    const row = new GridRow(oldLabel);
    await row.dropdown().click();
    await row.edit().click();
    await FU.input('WeekendModalCtrl.weekend.label', newLabel);

    $('[data-label="FORM.LABELS.WEEK_DAYS.SUNDAY"]').click();
    $('[data-label="FORM.LABELS.WEEK_DAYS.MONDAY"]').click();
    $('[data-label="FORM.LABELS.WEEK_DAYS.SATURDAY"]').click();

    await FU.modal.submit();
    await notification.hasSuccess();
  }

  async remove(label) {
    const row = new GridRow(label);
    await row.dropdown().click();
    await row.remove().click();
  }
}

module.exports = WeekendConfigPage;
