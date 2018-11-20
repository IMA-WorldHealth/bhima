/* global $$ */
/* eslint class-methods-use-this:off */

const GridRow = require('../shared/GridRow');
const FU = require('../shared/FormUtils');
const { notification } = require('../shared/components');

class WeekendConfigPage {

  create(label) {
    FU.buttons.create();
    FU.input('WeekendModalCtrl.weekend.label', label);
    FU.modal.submit();
    notification.hasSuccess();
  }

  /**
   * block creation without the function name
   */
  errorOnCreateWeekendConfig() {
    FU.buttons.create();
    FU.buttons.submit();
    FU.validation.error('WeekendModalCtrl.weekend.label');
    FU.buttons.cancel();
  }

  update(oldLabel, newLabel) {
    const row = new GridRow(oldLabel);
    row.dropdown().click();
    row.edit().click();
    FU.input('WeekendModalCtrl.weekend.label', newLabel);
    FU.modal.submit();
    notification.hasSuccess();
  }

  setWeekendConfig(label) {
    const row = new GridRow(label);
    row.dropdown().click();
    row.method('configure').click();

    // set days
    const days = $$('[name="days"]');
    days.get(0).click();
    days.get(1).click();
    days.get(6).click();

    FU.modal.submit();
    notification.hasSuccess();
  }

  unsetWeekendConfig(label) {
    const row = new GridRow(label);
    row.dropdown().click();
    row.method('configure').click();

    // set days
    const days = $$('[name="days"]');
    days.get(0).click();
    days.get(1).click();
    days.get(6).click();

    FU.modal.submit();
    notification.hasSuccess();
  }

  remove(label) {
    const row = new GridRow(label);
    row.dropdown().click();
    row.remove().click();
  }
}

module.exports = WeekendConfigPage;
