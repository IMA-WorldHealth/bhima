/* global element, by */

/**
 * This class is represents a rubric page in term of structure and
 * behaviour so it is a rubric page object
 */

const chai = require('chai');
const helpers = require('../shared/helpers');

helpers.configure(chai);

/* loading grid actions */
const GA = require('../shared/GridAction');
const GU = require('../shared/GridUtils');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');

class RubricPage {
  constructor() {
    this.gridId = 'rubric-grid';
    this.rubricGrid = element(by.id(this.gridId));
    this.actionLinkColumn = 7;
  }

  /**
   * send back the number of rubrics in the grid
   */
  getRubricCount() {
    return this.rubricGrid
      .element(by.css('.ui-grid-render-container-body'))
      .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'))
      .count();
  }

  /**
   * simulate the create rubric button click to show the dialog of creation
   */
  createRubric(rubric) {
    FU.buttons.create();
    FU.input('RubricModalCtrl.rubric.label', rubric.label);
    FU.input('RubricModalCtrl.rubric.abbr', rubric.abbr);

    if (rubric.is_discount) {
      element(by.css('[name="is_discount"]')).click();
    }

    if (rubric.is_percent) {
      element(by.css('[name="is_percent"]')).click();
    }

    if (rubric.is_social_care) {
      element(by.css('[name="is_social_care"]')).click();
    }

    FU.input('RubricModalCtrl.rubric.value', rubric.value);

    FU.buttons.submit();
    components.notification.hasSuccess();
  }

  /**
   * block creation without the function name
   */
  errorOnCreateRubric() {
    FU.buttons.create();
    FU.buttons.submit();
    FU.validation.error('RubricModalCtrl.rubric.label');
    FU.buttons.cancel();
  }

  /**
   * simulate a click on the edit link of a function
   */
  editRubric(label, updateRubric) {
    GU.getGridIndexesMatchingText(this.gridId, label)
      .then(indices => {
        const { rowIndex } = indices;
        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'edit', this.gridId);
        FU.input('RubricModalCtrl.rubric.label', updateRubric.label);

        if (updateRubric.is_percent) {
          element(by.css('[name="is_percent"]')).click();
        }

        FU.buttons.submit();
        components.notification.hasSuccess();
      });
  }

  /**
   * simulate a click on the delete link of a function
   */
  deleteRubric(label) {
    GU.getGridIndexesMatchingText(this.gridId, label)
      .then(indices => {
        const { rowIndex } = indices;
        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'delete', this.gridId);
        components.modalAction.confirm();
        components.notification.hasSuccess();
      });
  }

  /**
   * cancel deletion process
   */
  cancelDeleteRubric(n) {
    GA.clickOnMethod(n, this.actionLinkColumn, 'delete', this.gridId);
    components.modalAction.dismiss();
  }

  /**
   * forbid deletion of used function
   */
  errorOnDeleteRubric(n) {
    GA.clickOnMethod(n, this.actionLinkColumn, 'delete', this.gridId);
    components.modalAction.confirm();
    components.notification.hasError();
  }

  /**
  * select the User Rubrics
  */
  selectUserRubric(rubrics) {
    components.multipleRubricSelect.set(rubrics);    
  }

  /**
  * Submit button User Rubric
  */
  submitUserRubric() {
    FU.buttons.submit();
    components.notification.hasSuccess();
  }

}

module.exports = RubricPage;