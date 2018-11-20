/* eslint class-methods-use-this:off */

/* loading grid actions */
const GridRow = require('../shared/GridRow');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');

class HolidayPage {
  constructor() {
    this.modal = $('[uib-modal-window]');
  }

  /**
   * simulate the create holiday button click to show the dialog of creation
   */
  create(holiday) {
    FU.buttons.create();
    components.employeeSelect.set('Employee');

    FU.input('HolidayModalCtrl.holiday.label', holiday.label);
    FU.input('HolidayModalCtrl.holiday.percentage', holiday.percentage);

    components.dateInterval.range(holiday.dateFrom, holiday.dateTo);

    FU.modal.submit();
    components.notification.hasSuccess();
  }

  /**
   * Prevent the definition of a nested vacation period
   */
  preventHoliday(holiday) {
    FU.buttons.create();
    components.employeeSelect.set('Employee');

    FU.input('HolidayModalCtrl.holiday.label', holiday.label, this.modal);
    FU.input('HolidayModalCtrl.holiday.percentage', holiday.percentage, this.modal);

    components.dateInterval.range(holiday.dateFrom, holiday.dateTo);

    FU.modal.submit();
    FU.buttons.cancel();

    components.notification.hasError();
  }

  /**
   * block creation without the function name
   */
  errorOnCreateHoliday() {
    FU.buttons.create();
    FU.buttons.submit();
    FU.validation.error('HolidayModalCtrl.holiday.label');
    FU.buttons.cancel();
  }

  /**
   * simulate a click on the edit link of a function
   */
  update(label, updateHoliday) {
    const row = new GridRow(label);
    row.dropdown().click();
    row.edit().click();

    FU.input('HolidayModalCtrl.holiday.label', updateHoliday.label, this.modal);

    FU.buttons.submit();
    components.notification.hasSuccess();
  }

  remove(label) {
    const row = new GridRow(label);
    row.dropdown().click();
    row.remove().click();
    FU.modal.submit();
    components.notification.hasSuccess();
  }
}

module.exports = HolidayPage;
