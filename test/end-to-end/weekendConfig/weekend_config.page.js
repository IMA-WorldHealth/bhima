/* global $$ */

const GridRow = require('../shared/GridRow');
const FU = require('../shared/FormUtils');
const { notification } = require('../shared/components');

class WeekendConfigPage {

  async create(label) {
    await FU.buttons.create();
    await FU.input('WeekendModalCtrl.weekend.label', label);
    // set days
    const days = $$('[name="days"]');
    await days.get(0).click();
    await days.get(1).click();
    await days.get(6).click();

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

    // set days
    const days = $$('[name="days"]');
    await days.get(0).click();
    await days.get(1).click();
    await days.get(6).click();

    await FU.modal.submit();
    await notification.hasSuccess();
  }

  async setWeekendConfig(label) {
    const row = new GridRow(label);
    await row.dropdown().click();
    await row.method('configure').click();

    // set days
    const days = $$('[name="days"]');
    await days.get(0).click();
    await days.get(1).click();
    await days.get(6).click();
    await FU.modal.submit();
    await notification.hasSuccess();
  }

  async unsetWeekendConfig(label) {
    const row = new GridRow(label);
    await row.dropdown().click();
    await row.method('configure').click();

    // set days
    const days = $$('[name="days"]');
    await days.get(0).click();
    await days.get(1).click();
    await days.get(6).click();

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
