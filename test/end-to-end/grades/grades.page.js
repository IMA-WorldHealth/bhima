/* global element, by */

/**
 * This class is represents a grade page in term of structure and
 * behaviour so it is a grade page object
 */

const chai = require('chai');
const helpers = require('../shared/helpers');

helpers.configure(chai);

/* loading grid actions */
const GA = require('../shared/GridAction');
const GU = require('../shared/GridUtils');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');

class GradePage {
  constructor() {
    this.gridId = 'grade-grid';
    this.gradeGrid = element(by.id(this.gridId));
    this.actionLinkColumn = 3;
  }

  /**
   * send back the number of grades in the grid
   */
  getGradeCount() {
    return this.gradeGrid
      .element(by.css('.ui-grid-render-container-body'))
      .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'))
      .count();
  }

  /**
   * simulate the create grade button click to show the dialog of creation
   */
  createGrade(grade) {
    FU.buttons.create();

    FU.input('GradeModalCtrl.grade.text', grade.text);
    FU.input('GradeModalCtrl.grade.code', grade.code);
    FU.input('GradeModalCtrl.grade.basic_salary', grade.basic_salary);

    FU.buttons.submit();
    components.notification.hasSuccess();
  }

  /**
   * block creation without the grade name
   */
  errorOnCreateGrade() {
    FU.buttons.create();
    FU.buttons.submit();
    FU.validation.error('GradeModalCtrl.grade.text');
    FU.buttons.cancel();
  }

  /**
   * simulate a click on the edit link of a grade
   */
  editGrade(text, newGrade) {
    GU.getGridIndexesMatchingText(this.gridId, text)
      .then(indices => {
        const { rowIndex } = indices;
        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'edit', this.gridId);

        FU.input('GradeModalCtrl.grade.text', newGrade.text);
        FU.input('GradeModalCtrl.grade.code', newGrade.code);
        FU.input('GradeModalCtrl.grade.basic_salary', newGrade.basic_salary);

        FU.buttons.submit();
        components.notification.hasSuccess();
      });
  }

  /**
   * simulate a click on the delete link of a grade
   */
  deleteGrade(text) {
    GU.getGridIndexesMatchingText(this.gridId, text)
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
  cancelDeleteGrade(n) {
    GA.clickOnMethod(n, this.actionLinkColumn, 'delete', this.gridId);
    components.modalAction.dismiss();
  }

  /**
   * forbid deletion of used grade
   */
  errorOnDeleteGrade(n) {
    GA.clickOnMethod(n, this.actionLinkColumn, 'delete', this.gridId);
    components.modalAction.confirm();
    components.notification.hasError();
  }

  /**
  * select the User Grades
  */
  selectUserGrade(grades) {
    components.multipleGradeSelect.set(grades);    
  }

  /**
  * Submit button User Grade
  */
  submitUserGrade() {
    FU.buttons.submit();
    components.notification.hasSuccess();
  }

}

module.exports = GradePage;
