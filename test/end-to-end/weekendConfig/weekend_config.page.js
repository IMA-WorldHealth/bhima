const TU = require('../shared/TestUtils');

const GridRow = require('../shared/GridRow');
const { notification } = require('../shared/components');

class WeekendConfigPage {

  async create(label) {
    await TU.buttons.create();
    await TU.input('WeekendModalCtrl.weekend.label', label);

    await TU.locator('[data-label="FORM.LABELS.WEEK_DAYS.SUNDAY"]').click();
    await TU.locator('[data-label="FORM.LABELS.WEEK_DAYS.MONDAY"]').click();
    await TU.locator('[data-label="FORM.LABELS.WEEK_DAYS.SATURDAY"]').click();

    await TU.modal.submit();
    return notification.hasSuccess();
  }

  async errorOnCreateWeekendConfig() {
    await TU.buttons.create();
    await TU.buttons.submit();
    await TU.validation.error('WeekendModalCtrl.weekend.label');

    return TU.buttons.cancel();
  }

  async update(oldLabel, newLabel) {
    const row = new GridRow(oldLabel);
    await row.dropdown();
    await row.edit();
    await TU.input('WeekendModalCtrl.weekend.label', newLabel);

    await TU.locator('[data-label="FORM.LABELS.WEEK_DAYS.SUNDAY"]').click();
    await TU.locator('[data-label="FORM.LABELS.WEEK_DAYS.MONDAY"]').click();
    await TU.locator('[data-label="FORM.LABELS.WEEK_DAYS.SATURDAY"]').click();

    await TU.modal.submit();
    return notification.hasSuccess();
  }

  async remove(label) {
    const row = new GridRow(label);
    await row.dropdown();
    return row.remove();
  }
}

module.exports = WeekendConfigPage;
