/* eslint  */

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
  async create(holiday) {
    await FU.buttons.create();
    await components.employeeSelect.set('Employee');
    await FU.input('HolidayModalCtrl.holiday.label', holiday.label);
    await FU.input('HolidayModalCtrl.holiday.percentage', holiday.percentage);
    await components.dateInterval.range(holiday.dateFrom, holiday.dateTo);
    await FU.modal.submit();
    await components.notification.hasSuccess();
  }

  /**
   * Prevent the definition of a nested vacation period
   */
  async preventHoliday(holiday) {
    await FU.buttons.create();
    await components.employeeSelect.set('Employee');
    await FU.input('HolidayModalCtrl.holiday.label', holiday.label, this.modal);
    await FU.input('HolidayModalCtrl.holiday.percentage', holiday.percentage, this.modal);
    await components.dateInterval.range(holiday.dateFrom, holiday.dateTo);
    await FU.modal.submit();
    await FU.buttons.cancel();
    await components.notification.hasError();
  }

  /**
   * block creation without the function name
   */
  async errorOnCreateHoliday() {
    await FU.buttons.create();
    await FU.buttons.submit();
    await FU.validation.error('HolidayModalCtrl.holiday.label');
    await FU.buttons.cancel();
  }

  /**
   * simulate a click on the edit link of a function
   */
  async update(label, updateHoliday) {
    const row = new GridRow(label);
    await row.dropdown().click();
    await row.edit().click();

    await FU.input('HolidayModalCtrl.holiday.label', updateHoliday.label, this.modal);

    await FU.buttons.submit();
    await components.notification.hasSuccess();
  }

  async remove(label) {
    const row = new GridRow(label);
    await row.dropdown().click();
    await row.remove().click();
    await FU.modal.submit();
    await components.notification.hasSuccess();
  }
}

module.exports = HolidayPage;
