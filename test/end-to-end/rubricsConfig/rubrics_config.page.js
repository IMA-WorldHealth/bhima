/* global element, by */

/**
 * This class is represents a rubric Configuration page in term of structure and
 * behaviour so it is a rubric configuration page object
 */

const chai = require('chai');
const helpers = require('../shared/helpers');

helpers.configure(chai);

/* loading grid actions */
const GA = require('../shared/GridAction');
const GU = require('../shared/GridUtils');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');

class RubricConfigPage {
  constructor() {
    this.gridId = 'rubric-grid';
    this.rubricGrid = element(by.id(this.gridId));
    this.actionLinkColumn = 1;
  }

  /**
   * send back the number of rubrics in the grid
   */
  getRubricConfigCount() {
    return this.rubricGrid
      .element(by.css('.ui-grid-render-container-body'))
      .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'))
      .count();
  }

  /**
   * simulate the create rubric Configuration button click to show the dialog of creation
   */
  createRubricConfig(rubric) {
    FU.buttons.create();
    FU.input('ConfigModalCtrl.rubric.label', rubric.label);

    FU.buttons.submit();
    components.notification.hasSuccess();
  }

  /**
   * block creation without the function name
   */
  errorOnCreateRubricConfig() {
    FU.buttons.create();
    FU.buttons.submit();
    FU.validation.error('ConfigModalCtrl.rubric.label');
    FU.buttons.cancel();
  }

  /**
   * simulate a click on the edit link of a function
   */
  editRubricConfig(label, updateRubricConfig) {
    GU.getGridIndexesMatchingText(this.gridId, label)
      .then(indices => {
        const { rowIndex } = indices;
        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'edit', this.gridId);
        FU.input('ConfigModalCtrl.rubric.label', updateRubricConfig.label);

        FU.buttons.submit();
        components.notification.hasSuccess();
      });
  }

  /**
   * simulate a click on the Configure link of a function
   */
  setRubricConfig(label) {
    GU.getGridIndexesMatchingText(this.gridId, label)
      .then(indices => {
        const { rowIndex } = indices;
        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'config', this.gridId);
        element(by.id('social')).click();        
        element(by.id('tax')).click();
        FU.buttons.submit();
        components.notification.hasSuccess();
      });
  }

  /**
   * simulate a click on the Configure link of a function for Inset Rubric
   */
  inSetRubricConfig(label) {
    GU.getGridIndexesMatchingText(this.gridId, label)
      .then(indices => {
        const { rowIndex } = indices;
        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'config', this.gridId);
        // First click for select all
        element(by.id('all')).click();

        // Second click for unselect all        
        element(by.id('all')).click();
        FU.buttons.submit();
        components.notification.hasSuccess();
      });
  }

  /**
   * simulate a click on the delete link of a function
   */
  deleteRubricConfig(label) {
    GU.getGridIndexesMatchingText(this.gridId, label)
      .then(indices => {
        const { rowIndex } = indices;
        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'delete', this.gridId);
        components.modalAction.confirm();
        components.notification.hasSuccess();
      });
  }
}

module.exports = RubricConfigPage;
