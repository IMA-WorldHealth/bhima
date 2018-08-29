/* global element, by */

/**
 * This class is represents a holiday page in term of structure and
 * behaviour so it is a holiday page object
 */

/* loading grid actions */
const GA = require('../shared/GridAction');
const GU = require('../shared/GridUtils');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');

class HolidayPage {
  constructor() {
    this.gridId = 'holiday-grid';
    this.holidayGrid = element(by.id(this.gridId));
    this.actionLinkColumn = 5;
  }

  /**
   * simulate the create holiday button click to show the dialog of creation
   */
  createHoliday(holiday) {
    FU.buttons.create();
    components.employeeSelect.set('Test');

    FU.input('HolidayModalCtrl.holiday.label', holiday.label);
    FU.input('HolidayModalCtrl.holiday.percentage', holiday.percentage);

    components.dateInterval.range(holiday.dateFrom, holiday.dateTo);

    FU.buttons.submit();
    components.notification.hasSuccess();
  }

  /**
   * Prevent the definition of a nested vacation period
   */
  preventHoliday(holiday) {
    FU.buttons.create();
    components.employeeSelect.set('Test');

    FU.input('HolidayModalCtrl.holiday.label', holiday.label);
    FU.input('HolidayModalCtrl.holiday.percentage', holiday.percentage);

    components.dateInterval.range(holiday.dateFrom, holiday.dateTo);

    FU.buttons.submit();
    FU.buttons.cancel();

    // FIX ME TO CHECK ERROR UNDER THE MODAL
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
  editHoliday(label, updateHoliday) {
    GU.getGridIndexesMatchingText(this.gridId, label)
      .then(indices => {
        const { rowIndex } = indices;
        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'edit', this.gridId);
        FU.input('HolidayModalCtrl.holiday.label', updateHoliday.label);

        FU.buttons.submit();
        components.notification.hasSuccess();
      });
  }

  /**
   * simulate a click on the delete link of a function
   */
  deleteHoliday(label) {
    GU.getGridIndexesMatchingText(this.gridId, label)
      .then(indices => {
        const { rowIndex } = indices;
        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'delete', this.gridId);
        components.modalAction.confirm();
        components.notification.hasSuccess();
      });
  }
}

module.exports = HolidayPage;
