/* global element, by */

/**
 * This class is represents a weekEnd Configuration page in term of structure and
 * behaviour so it is a weekEnd configuration page object
 */

const chai = require('chai');
const helpers = require('../shared/helpers');

helpers.configure(chai);

/* loading grid actions */
const GA = require('../shared/GridAction');
const GU = require('../shared/GridUtils');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');

class WeekEndConfigPage {
  constructor() {
    this.gridId = 'weekEnd-config-grid';
    this.weekEndGrid = element(by.id(this.gridId));
    this.actionLinkColumn = 1;
  }

  /**
   * simulate the create weekEnd Configuration button click to show the dialog of creation
   */
  createWeekEndConfig(weekEnd) {
    FU.buttons.create();
    FU.input('WeekEndModalCtrl.weekend.label', weekEnd.label);

    FU.buttons.submit();
    components.notification.hasSuccess();
  }

  /**
   * block creation without the function name
   */
  errorOnCreateWeekEndConfig() {
    FU.buttons.create();
    FU.buttons.submit();
    FU.validation.error('WeekEndModalCtrl.weekend.label');
    FU.buttons.cancel();
  }

  /**
   * simulate a click on the edit link of a function
   */
  editWeekEndConfig(label, updateWeekEndConfig) {
    GU.getGridIndexesMatchingText(this.gridId, label)
      .then(indices => {
        const { rowIndex } = indices;
        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'edit', this.gridId);
        FU.input('WeekEndModalCtrl.weekend.label', updateWeekEndConfig.label);

        FU.buttons.submit();
        components.notification.hasSuccess();
      });
  }

  /**
   * simulate a click on the Configure link of a function
   */
  setWeekEndConfig(label) {
    GU.getGridIndexesMatchingText(this.gridId, label)
      .then(indices => {
        const { rowIndex } = indices;
        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'config', this.gridId);

        element.all(by.css('[name="days"]')).get(0).click();
        element.all(by.css('[name="days"]')).get(1).click();
        element.all(by.css('[name="days"]')).get(6).click();

        FU.buttons.submit();
        components.notification.hasSuccess();
      });
  }

  /**
   * simulate a click on the Configure link of a function for Inset WeekEnd
   */
  inSetWeekEndConfig(label) {
    GU.getGridIndexesMatchingText(this.gridId, label)
      .then(indices => {
        const { rowIndex } = indices;
        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'config', this.gridId);

        element.all(by.css('[name="days"]')).get(0).click();
        element.all(by.css('[name="days"]')).get(1).click();
        element.all(by.css('[name="days"]')).get(6).click();

        FU.buttons.submit();
        components.notification.hasSuccess();
      });
  }

  /**
   * simulate a click on the delete link of a function
   */
  deleteWeekEndConfig(label) {
    GU.getGridIndexesMatchingText(this.gridId, label)
      .then(indices => {
        const { rowIndex } = indices;
        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'delete', this.gridId);
        components.modalAction.confirm();
        components.notification.hasSuccess();
      });
  }
}

module.exports = WeekEndConfigPage;
